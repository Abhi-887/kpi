<?php

use App\Models\ExchangeRate;
use App\Services\ExchangeRateEngine;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Setup called in global scope

    // Create some test rates
    ExchangeRate::create([
        'from_currency' => 'USD',
        'to_currency' => 'INR',
        'rate' => 83.28,
        'inverse_rate' => 1 / 83.28,
        'effective_date' => '2025-11-01',
        'source' => 'test',
        'status' => 'active',
    ]);

    ExchangeRate::create([
        'from_currency' => 'EUR',
        'to_currency' => 'INR',
        'rate' => 90.45,
        'inverse_rate' => 1 / 90.45,
        'effective_date' => '2025-11-01',
        'source' => 'test',
        'status' => 'active',
    ]);

    ExchangeRate::create([
        'from_currency' => 'USD',
        'to_currency' => 'INR',
        'rate' => 84.10,
        'inverse_rate' => 1 / 84.10,
        'effective_date' => '2025-11-05',
        'source' => 'test',
        'status' => 'active',
    ]);
});

describe('ExchangeRateEngine', function () {
    describe('getRate', function () {
        it('returns correct rate for currency pair on exact date', function () {
            $rate = $this->engine->getRate('USD', 'INR', '2025-11-01');
            expect($rate)->toBe(83.28);
        });

        it('returns most recent rate when querying date after effective date', function () {
            $rate = $this->engine->getRate('USD', 'INR', '2025-11-06');
            expect($rate)->toBe(84.10);
        });

        it('returns null for non-existent currency pair', function () {
            $rate = $this->engine->getRate('GBP', 'INR', '2025-11-01');
            expect($rate)->toBeNull();
        });

        it('returns 1.0 for same currency pair', function () {
            $rate = $this->engine->getRate('INR', 'INR', '2025-11-01');
            expect($rate)->toBe(1.0);
        });

        it('handles case-insensitive currency codes', function () {
            $rate = $this->engine->getRate('usd', 'inr', '2025-11-01');
            expect($rate)->toBe(83.28);
        });

        it('returns null when date is before first effective date', function () {
            $rate = $this->engine->getRate('USD', 'INR', '2025-10-01');
            expect($rate)->toBeNull();
        });

        it('defaults to today when date not provided', function () {
            // Today should find the latest rate
            $rate = $this->engine->getRate('USD', 'INR');
            expect($rate)->toBe(84.10);
        });
    });

    describe('convert', function () {
        it('converts amount correctly', function () {
            $converted = $this->engine->convert(100, 'USD', 'INR', '2025-11-01');
            expect($converted)->toBe(8328.0);
        });

        it('returns null for non-existent rate', function () {
            $converted = $this->engine->convert(100, 'GBP', 'INR', '2025-11-01');
            expect($converted)->toBeNull();
        });

        it('converts with decimal precision', function () {
            $converted = $this->engine->convert(50.5, 'USD', 'INR', '2025-11-01');
            expect($converted)->toBeCloseTo(4205.64, 2);
        });
    });

    describe('getInverseRate', function () {
        it('returns inverse rate for currency pair', function () {
            $inverseRate = $this->engine->getInverseRate('USD', 'INR', '2025-11-01');
            expect($inverseRate)->toBeCloseTo(1 / 83.28, 6);
        });

        it('returns null for non-existent pair', function () {
            $inverseRate = $this->engine->getInverseRate('GBP', 'INR', '2025-11-01');
            expect($inverseRate)->toBeNull();
        });
    });

    describe('getRatesForCurrency', function () {
        it('returns all rates for a base currency', function () {
            $rates = $this->engine->getRatesForCurrency('INR', '2025-11-01');
            expect($rates)->toHaveKey('USD');
            expect($rates)->toHaveKey('EUR');
            expect($rates['USD']['rate'])->toBe(83.28);
            expect($rates['EUR']['rate'])->toBe(90.45);
        });

        it('returns rates only up to specified date', function () {
            $rates = $this->engine->getRatesForCurrency('INR', '2025-11-02');
            expect($rates['USD']['rate'])->toBe(83.28); // Not updated yet
        });

        it('returns empty collection for non-existent base', function () {
            $rates = $this->engine->getRatesForCurrency('XYZ', '2025-11-01');
            expect($rates->count())->toBe(0);
        });
    });

    describe('bulkUpdateRates', function () {
        it('creates new rates for multiple currencies', function () {
            $rates = [
                'GBP' => 98.50,
                'JPY' => 0.56,
                'CAD' => 61.20,
            ];

            $created = $this->engine->bulkUpdateRates($rates, 'INR', '2025-11-07');

            expect($created->count())->toBe(3);
            expect(ExchangeRate::where('from_currency', 'GBP')->where('effective_date', '2025-11-07')->exists())->toBeTrue();
        });

        it('deactivates previous rates when creating new ones', function () {
            $rates = ['USD' => 85.00];
            $this->engine->bulkUpdateRates($rates, 'INR', '2025-11-08');

            $oldRate = ExchangeRate::where('from_currency', 'USD')
                ->where('effective_date', '2025-11-01')
                ->first();

            expect($oldRate?->status)->toBe('inactive');
        });

        it('skips same currency as base', function () {
            $rates = [
                'INR' => 1.0,
                'USD' => 83.28,
            ];

            $created = $this->engine->bulkUpdateRates($rates, 'INR', '2025-11-07');
            expect($created->count())->toBe(1); // Only USD
        });

        it('sets correct inverse rate', function () {
            $rates = ['USD' => 85.00];
            $this->engine->bulkUpdateRates($rates, 'INR', '2025-11-08');

            $rate = ExchangeRate::where('from_currency', 'USD')
                ->where('effective_date', '2025-11-08')
                ->first();

            expect($rate)->not->toBeNull();
            $expectedInverse = 1 / 85.00;
            expect((float) $rate->inverse_rate)->toBeCloseTo($expectedInverse, 6);
        });
    });

    describe('getHistory', function () {
        it('returns historical rates for currency pair', function () {
            $history = $this->engine->getHistory('USD', 'INR', 10);
            expect($history->count())->toBe(2);
            expect($history[0]->effective_date->format('Y-m-d'))->toBe('2025-11-05');
        });

        it('respects limit parameter', function () {
            $history = $this->engine->getHistory('USD', 'INR', 1);
            expect($history->count())->toBe(1);
        });

        it('returns empty collection for non-existent pair', function () {
            $history = $this->engine->getHistory('GBP', 'INR');
            expect($history->count())->toBe(0);
        });
    });

    describe('getRateRecord', function () {
        it('returns exact rate record for date match', function () {
            $record = $this->engine->getRateRecord('USD', 'INR', '2025-11-01');
            expect($record)->not->toBeNull();
            expect((float) $record->rate)->toBe(83.28);
        });

        it('returns null when date does not match exactly', function () {
            $record = $this->engine->getRateRecord('USD', 'INR', '2025-11-02');
            expect($record)->toBeNull();
        });
    });

    describe('hasRate', function () {
        it('returns true when rate exists within date range', function () {
            $has = $this->engine->hasRate('USD', 'INR', '2025-11-01', '2025-11-05');
            expect($has)->toBeTrue();
        });

        it('returns false for non-existent pair', function () {
            $has = $this->engine->hasRate('GBP', 'INR', '2025-11-01', '2025-11-05');
            expect($has)->toBeFalse();
        });

        it('defaults end date to start date when not provided', function () {
            $has = $this->engine->hasRate('USD', 'INR', '2025-11-01');
            expect($has)->toBeTrue();
        });
    });

    describe('getActivePairs', function () {
        it('returns all active currency pairs', function () {
            $pairs = $this->engine->getActivePairs();
            expect($pairs->keys())->toContain('USD', 'EUR');
        });

        it('returns currencies for each base currency', function () {
            $pairs = $this->engine->getActivePairs();
            expect($pairs['USD'])->toContain('INR');
        });
    });

    describe('validateRates', function () {
        it('validates positive rates', function () {
            $validation = $this->engine->validateRates([
                'USD' => 83.28,
                'EUR' => 90.45,
            ]);

            expect($validation['valid'])->toBeTrue();
            expect($validation['errors'])->toBeEmpty();
        });

        it('rejects negative rates', function () {
            $validation = $this->engine->validateRates([
                'USD' => -83.28,
            ]);

            expect($validation['valid'])->toBeFalse();
            expect($validation['errors'])->not->toBeEmpty();
        });

        it('rejects zero rates', function () {
            $validation = $this->engine->validateRates([
                'USD' => 0,
            ]);

            expect($validation['valid'])->toBeFalse();
        });

        it('rejects non-numeric rates', function () {
            $validation = $this->engine->validateRates([
                'USD' => 'abc',
            ]);

            expect($validation['valid'])->toBeFalse();
        });

        it('rejects base currency in rates', function () {
            $validation = $this->engine->validateRates([
                'INR' => 1.0,
            ], 'INR');

            expect($validation['valid'])->toBeFalse();
        });

        it('rejects invalid currency codes', function () {
            $validation = $this->engine->validateRates([
                'USDA' => 83.28,
            ]);

            expect($validation['valid'])->toBeFalse();
        });
    });
});
