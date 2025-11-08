<?php

use App\Models\ExchangeRate;
use App\Services\ExchangeRateEngine;

beforeEach(function () {
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

test('get rate returns correct rate for currency pair', function () {
    $engine = app(ExchangeRateEngine::class);
    $rate = $engine->getRate('USD', 'INR', '2025-11-01');
    expect($rate)->toBe(83.28);
});

test('get rate returns most recent rate for future dates', function () {
    $engine = app(ExchangeRateEngine::class);
    $rate = $engine->getRate('USD', 'INR', '2025-11-06');
    expect($rate)->toBe(84.10);
});

test('convert amount correctly', function () {
    $engine = app(ExchangeRateEngine::class);
    $converted = $engine->convert(100, 'USD', 'INR', '2025-11-01');
    expect($converted)->toBe(8328.0);
});

test('bulk update rates creates new records', function () {
    $engine = app(ExchangeRateEngine::class);
    $rates = ['GBP' => 98.50];
    $created = $engine->bulkUpdateRates($rates, 'INR', '2025-11-07');
    expect($created->count())->toBe(1);
    expect(ExchangeRate::where('from_currency', 'GBP')->exists())->toBeTrue();
});

test('get rates for currency returns collection', function () {
    $engine = app(ExchangeRateEngine::class);
    $rates = $engine->getRatesForCurrency('INR', '2025-11-01');
    expect($rates)->toHaveKey('USD');
    expect($rates['USD']['rate'])->toBe(83.28);
});

test('get history returns rate history', function () {
    $engine = app(ExchangeRateEngine::class);
    $history = $engine->getHistory('USD', 'INR', 10);
    expect($history->count())->toBe(2);
});

test('validate rates accepts valid data', function () {
    $engine = app(ExchangeRateEngine::class);
    $validation = $engine->validateRates(['USD' => 83.28, 'EUR' => 90.45]);
    expect($validation['valid'])->toBeTrue();
});

test('validate rates rejects negative rates', function () {
    $engine = app(ExchangeRateEngine::class);
    $validation = $engine->validateRates(['USD' => -83.28]);
    expect($validation['valid'])->toBeFalse();
});
