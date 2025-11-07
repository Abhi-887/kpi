<?php

use App\Models\Charge;
use App\Models\Location;
use App\Models\Supplier;
use App\Models\UnitOfMeasure;
use App\Models\VendorRateHeader;
use App\Models\VendorRateLine;
use App\Services\RateEngine;

beforeEach(function () {
    $this->rateEngine = app(RateEngine::class);
});

describe('FindMatchingCosts', function () {
    it('finds matching costs for a shipment with single vendor', function () {
        $vendor = Supplier::factory()->create(['is_active' => true]);
        $originPort = Location::factory()->create(['code' => 'NYC', 'is_active' => true]);
        $destPort = Location::factory()->create(['code' => 'LAX', 'is_active' => true]);
        $charge = Charge::factory()->create(['is_active' => true]);
        $uom = UnitOfMeasure::factory()->create();

        $header = VendorRateHeader::factory()->create([
            'vendor_id' => $vendor->id,
            'origin_port_id' => $originPort->id,
            'destination_port_id' => $destPort->id,
            'mode' => 'AIR',
            'movement' => 'EXPORT',
            'terms' => 'FOB',
            'valid_from' => now()->subDay(),
            'valid_upto' => now()->addDay(),
            'is_active' => true,
        ]);

        VendorRateLine::factory()->create([
            'rate_header_id' => $header->id,
            'charge_id' => $charge->id,
            'uom_id' => $uom->id,
            'slab_min' => 0,
            'slab_max' => 100,
            'cost_rate' => 150,
            'is_fixed_rate' => false,
            'is_active' => true,
        ]);

        $results = $this->rateEngine->findMatchingCosts([
            'origin_port_id' => $originPort->id,
            'destination_port_id' => $destPort->id,
            'mode' => 'AIR',
            'movement' => 'EXPORT',
            'terms' => 'FOB',
            'chargeable_weight' => 50,
            'date' => now(),
        ]);

        expect($results)->toHaveCount(1);
        expect($results[0]['vendor_id'])->toBe($vendor->id);
        expect($results[0]['vendor_name'])->toBe($vendor->name);
        expect($results[0]['charges'])->toHaveCount(1);
        expect($results[0]['charges'][0]['charge_id'])->toBe($charge->id);
        expect($results[0]['charges'][0]['cost_rate'])->toBe(150.0);
        expect($results[0]['charges'][0]['is_fixed_rate'])->toBeFalse();
    });

    it('filters rates by weight slabs correctly', function () {
        $vendor = Supplier::factory()->create(['is_active' => true]);
        $originPort = Location::factory()->create(['code' => 'ORG1', 'is_active' => true]);
        $destPort = Location::factory()->create(['code' => 'DST1', 'is_active' => true]);
        $charge = Charge::factory()->create(['is_active' => true]);
        $uom = UnitOfMeasure::factory()->create();

        $header = VendorRateHeader::factory()->create([
            'vendor_id' => $vendor->id,
            'origin_port_id' => $originPort->id,
            'destination_port_id' => $destPort->id,
            'valid_from' => now()->subDay(),
            'valid_upto' => now()->addDay(),
        ]);

        VendorRateLine::factory()->create([
            'rate_header_id' => $header->id,
            'charge_id' => $charge->id,
            'uom_id' => $uom->id,
            'slab_min' => 0,
            'slab_max' => 99,
            'cost_rate' => 200,
        ]);

        VendorRateLine::factory()->create([
            'rate_header_id' => $header->id,
            'charge_id' => $charge->id,
            'uom_id' => $uom->id,
            'slab_min' => 100,
            'slab_max' => 249,
            'cost_rate' => 120,
        ]);

        VendorRateLine::factory()->create([
            'rate_header_id' => $header->id,
            'charge_id' => $charge->id,
            'uom_id' => $uom->id,
            'slab_min' => 250,
            'slab_max' => 500,
            'cost_rate' => 110,
        ]);

        $result1 = $this->rateEngine->findMatchingCosts([
            'origin_port_id' => $originPort->id,
            'destination_port_id' => $destPort->id,
            'mode' => 'AIR',
            'movement' => 'EXPORT',
            'terms' => 'FOB',
            'chargeable_weight' => 50,
        ]);

        expect($result1)->toHaveCount(1);
        expect($result1[0]['charges'][0]['cost_rate'])->toBe(200.0);

        $result2 = $this->rateEngine->findMatchingCosts([
            'origin_port_id' => $originPort->id,
            'destination_port_id' => $destPort->id,
            'mode' => 'AIR',
            'movement' => 'EXPORT',
            'terms' => 'FOB',
            'chargeable_weight' => 150,
        ]);

        expect($result2)->toHaveCount(1);
        expect($result2[0]['charges'][0]['cost_rate'])->toBe(120.0);

        $result3 = $this->rateEngine->findMatchingCosts([
            'origin_port_id' => $originPort->id,
            'destination_port_id' => $destPort->id,
            'mode' => 'AIR',
            'movement' => 'EXPORT',
            'terms' => 'FOB',
            'chargeable_weight' => 300,
        ]);

        expect($result3)->toHaveCount(1);
        expect($result3[0]['charges'][0]['cost_rate'])->toBe(110.0);
    });

    it('returns empty results when date is outside validity range', function () {
        $vendor = Supplier::factory()->create(['is_active' => true]);
        $originPort = Location::factory()->create(['is_active' => true]);
        $destPort = Location::factory()->create(['is_active' => true]);

        VendorRateHeader::factory()->create([
            'vendor_id' => $vendor->id,
            'origin_port_id' => $originPort->id,
            'destination_port_id' => $destPort->id,
            'valid_from' => now()->addDays(5),
            'valid_upto' => now()->addDays(10),
        ]);

        $results = $this->rateEngine->findMatchingCosts([
            'origin_port_id' => $originPort->id,
            'destination_port_id' => $destPort->id,
            'mode' => 'AIR',
            'movement' => 'EXPORT',
            'terms' => 'FOB',
            'chargeable_weight' => 50,
            'date' => now(),
        ]);

        expect($results)->toHaveCount(0);
    });

    it('respects is_active flag', function () {
        $vendor = Supplier::factory()->create(['is_active' => true]);
        $originPort = Location::factory()->create(['is_active' => true]);
        $destPort = Location::factory()->create(['is_active' => true]);
        $charge = Charge::factory()->create(['is_active' => true]);
        $uom = UnitOfMeasure::factory()->create();

        $header = VendorRateHeader::factory()->create([
            'vendor_id' => $vendor->id,
            'origin_port_id' => $originPort->id,
            'destination_port_id' => $destPort->id,
            'is_active' => false,
            'valid_from' => now()->subDay(),
            'valid_upto' => now()->addDay(),
        ]);

        VendorRateLine::factory()->create([
            'rate_header_id' => $header->id,
            'charge_id' => $charge->id,
            'uom_id' => $uom->id,
            'is_active' => true,
        ]);

        $results = $this->rateEngine->findMatchingCosts([
            'origin_port_id' => $originPort->id,
            'destination_port_id' => $destPort->id,
            'mode' => 'AIR',
            'movement' => 'EXPORT',
            'terms' => 'FOB',
            'chargeable_weight' => 50,
        ]);

        expect($results)->toHaveCount(0);
    });

    it('returns results from multiple vendors', function () {
        $vendor1 = Supplier::factory()->create(['is_active' => true]);
        $vendor2 = Supplier::factory()->create(['is_active' => true]);
        $originPort = Location::factory()->create(['code' => 'ORG2', 'is_active' => true]);
        $destPort = Location::factory()->create(['code' => 'DST2', 'is_active' => true]);
        $charge = Charge::factory()->create(['is_active' => true]);
        $uom = UnitOfMeasure::factory()->create();

        $header1 = VendorRateHeader::factory()->create([
            'vendor_id' => $vendor1->id,
            'origin_port_id' => $originPort->id,
            'destination_port_id' => $destPort->id,
            'valid_from' => now()->subDay(),
            'valid_upto' => now()->addDay(),
        ]);

        VendorRateLine::factory()->create([
            'rate_header_id' => $header1->id,
            'charge_id' => $charge->id,
            'uom_id' => $uom->id,
            'cost_rate' => 100,
        ]);

        $header2 = VendorRateHeader::factory()->create([
            'vendor_id' => $vendor2->id,
            'origin_port_id' => $originPort->id,
            'destination_port_id' => $destPort->id,
            'valid_from' => now()->subDay(),
            'valid_upto' => now()->addDay(),
        ]);

        VendorRateLine::factory()->create([
            'rate_header_id' => $header2->id,
            'charge_id' => $charge->id,
            'uom_id' => $uom->id,
            'cost_rate' => 95,
        ]);

        $results = $this->rateEngine->findMatchingCosts([
            'origin_port_id' => $originPort->id,
            'destination_port_id' => $destPort->id,
            'mode' => 'AIR',
            'movement' => 'EXPORT',
            'terms' => 'FOB',
            'chargeable_weight' => 50,
        ]);

        expect($results)->toHaveCount(2);
        expect($results->pluck('vendor_id'))->toContain($vendor1->id, $vendor2->id);
    });
});

describe('ValidateRateHeader', function () {
    it('detects invalid date ranges', function () {
        $header = VendorRateHeader::factory()->create([
            'valid_from' => now()->addDay(),
            'valid_upto' => now()->subDay(),
        ]);

        $validation = $this->rateEngine->validateRateHeader($header->id);

        expect($validation['is_valid'])->toBeFalse();
        expect($validation['issues'])->toContain('Valid From date is after Valid Upto date');
    });
});

describe('CalculateVendorCost', function () {
    it('calculates total cost with variable and fixed rates', function () {
        $vendor = Supplier::factory()->create();
        $header = VendorRateHeader::factory()->create(['vendor_id' => $vendor->id]);
        $charge1 = Charge::factory()->create();
        $charge2 = Charge::factory()->create();
        $uom = UnitOfMeasure::factory()->create();

        VendorRateLine::factory()->create([
            'rate_header_id' => $header->id,
            'charge_id' => $charge1->id,
            'uom_id' => $uom->id,
            'slab_min' => 0,
            'slab_max' => 500,
            'cost_rate' => 10,
            'is_fixed_rate' => false,
        ]);

        VendorRateLine::factory()->create([
            'rate_header_id' => $header->id,
            'charge_id' => $charge2->id,
            'uom_id' => $uom->id,
            'slab_min' => 0,
            'slab_max' => 500,
            'cost_rate' => 50,
            'is_fixed_rate' => true,
        ]);

        $cost = $this->rateEngine->calculateVendorCost($header->id, 100);

        expect($cost)->toBe(1050.0);
    });
});
