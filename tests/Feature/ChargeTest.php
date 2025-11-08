<?php

use App\Enums\ChargeType;
use App\Models\Charge;
use App\Models\TaxCode;
use App\Models\UnitOfMeasure;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->uom = UnitOfMeasure::factory()->create();
    $this->tax = TaxCode::factory()->create();
});

test('can view charges index page', function () {
    $this->actingAs($this->user);

    $response = $this->get('/charges');

    $response->assertStatus(200);
});

test('can view create charge page', function () {
    $this->actingAs($this->user);

    $response = $this->get('/charges/create');

    $response->assertStatus(200);
});

test('can create a charge with fixed type', function () {
    $this->actingAs($this->user);

    $payload = [
        'charge_id' => 'CHG-001',
        'charge_code' => 'AFA',
        'charge_name' => 'AIR FREIGHT ALL IN CHARGES',
        'default_uom_id' => $this->uom->id,
        'default_tax_id' => $this->tax->id,
        'default_fixed_rate_inr' => 4500,
        'charge_type' => 'fixed',
        'is_active' => true,
        'description' => 'Air freight charges',
    ];

    $response = $this->post('/charges', $payload);

    $response->assertRedirect('/charges');

    $this->assertDatabaseHas('charges', [
        'charge_id' => 'CHG-001',
        'charge_code' => 'AFA',
        'charge_name' => 'AIR FREIGHT ALL IN CHARGES',
        'charge_type' => 'fixed',
        'is_active' => true,
    ]);
});

test('can create a charge with variable type', function () {
    $this->actingAs($this->user);

    $payload = [
        'charge_id' => 'CHG-002',
        'charge_code' => 'CUSCL',
        'charge_name' => 'CUSTOM CLEARANCE CHARGES',
        'default_uom_id' => $this->uom->id,
        'default_tax_id' => $this->tax->id,
        'default_fixed_rate_inr' => null,
        'charge_type' => 'variable',
        'is_active' => true,
    ];

    $response = $this->post('/charges', $payload);

    $response->assertRedirect('/charges');

    $this->assertDatabaseHas('charges', [
        'charge_id' => 'CHG-002',
        'charge_code' => 'CUSCL',
        'charge_type' => 'variable',
    ]);
});

test('can create a charge with weight-based type', function () {
    $this->actingAs($this->user);

    $payload = [
        'charge_id' => 'CHG-003',
        'charge_code' => 'WBD',
        'charge_name' => 'WEIGHT BASED CHARGES',
        'default_uom_id' => $this->uom->id,
        'default_tax_id' => $this->tax->id,
        'default_fixed_rate_inr' => 100,
        'charge_type' => 'weight_based',
        'is_active' => true,
    ];

    $response = $this->post('/charges', $payload);

    $response->assertRedirect('/charges');

    $this->assertDatabaseHas('charges', [
        'charge_id' => 'CHG-003',
        'charge_type' => 'weight_based',
    ]);
});

test('charge_id must be unique', function () {
    $this->actingAs($this->user);

    Charge::factory()->create(['charge_id' => 'CHG-001']);

    $payload = [
        'charge_id' => 'CHG-001',
        'charge_code' => 'DUP',
        'charge_name' => 'Duplicate',
        'default_uom_id' => $this->uom->id,
        'default_tax_id' => $this->tax->id,
        'default_fixed_rate_inr' => 500,
        'charge_type' => 'fixed',
    ];

    $response = $this->post('/charges', $payload);

    $response->assertSessionHasErrors('charge_id');
});

test('charge_code must be unique', function () {
    $this->actingAs($this->user);

    Charge::factory()->create(['charge_code' => 'AFA']);

    $payload = [
        'charge_id' => 'CHG-DUP',
        'charge_code' => 'AFA',
        'charge_name' => 'Duplicate Code',
        'default_uom_id' => $this->uom->id,
        'default_tax_id' => $this->tax->id,
        'default_fixed_rate_inr' => 500,
        'charge_type' => 'fixed',
    ];

    $response = $this->post('/charges', $payload);

    $response->assertSessionHasErrors('charge_code');
});

test('can update a charge', function () {
    $this->actingAs($this->user);

    $charge = Charge::factory()->create();

    $payload = [
        'charge_id' => $charge->charge_id,
        'charge_code' => 'UPDATED',
        'charge_name' => 'Updated Charge Name',
        'default_uom_id' => $this->uom->id,
        'default_tax_id' => $this->tax->id,
        'default_fixed_rate_inr' => 6000,
        'charge_type' => 'fixed',
        'is_active' => false,
    ];

    $response = $this->patch("/charges/{$charge->id}", $payload);

    $response->assertRedirect('/charges');

    $this->assertDatabaseHas('charges', [
        'id' => $charge->id,
        'charge_name' => 'Updated Charge Name',
        'charge_code' => 'UPDATED',
        'is_active' => false,
    ]);
});

test('can view edit charge page', function () {
    $this->actingAs($this->user);

    $charge = Charge::factory()->create();

    $response = $this->get("/charges/{$charge->id}/edit");

    $response->assertStatus(200);
});

test('can delete a charge', function () {
    $this->actingAs($this->user);

    $charge = Charge::factory()->create();

    $response = $this->delete("/charges/{$charge->id}");

    $response->assertRedirect('/charges');

    $this->assertDatabaseMissing('charges', [
        'id' => $charge->id,
    ]);
});

test('validates required fields on create', function () {
    $this->actingAs($this->user);

    $response = $this->post('/charges', []);

    $response->assertSessionHasErrors([
        'charge_id',
        'charge_code',
        'charge_name',
        'default_uom_id',
        'default_tax_id',
        'charge_type',
    ]);
});

test('validates charge_type enum values', function () {
    $this->actingAs($this->user);

    $payload = [
        'charge_id' => 'CHG-TEST',
        'charge_code' => 'TEST',
        'charge_name' => 'Test',
        'default_uom_id' => $this->uom->id,
        'default_tax_id' => $this->tax->id,
        'default_fixed_rate_inr' => 100,
        'charge_type' => 'invalid_type',
    ];

    $response = $this->post('/charges', $payload);

    $response->assertSessionHasErrors('charge_type');
});

test('validates uom and tax foreign keys', function () {
    $this->actingAs($this->user);

    $payload = [
        'charge_id' => 'CHG-TEST',
        'charge_code' => 'TEST',
        'charge_name' => 'Test',
        'default_uom_id' => 9999,
        'default_tax_id' => $this->tax->id,
        'default_fixed_rate_inr' => 100,
        'charge_type' => 'fixed',
    ];

    $response = $this->post('/charges', $payload);

    $response->assertSessionHasErrors('default_uom_id');
});

test('charge factory creates valid charge', function () {
    $charge = Charge::factory()->create();

    expect($charge)->toBeInstanceOf(Charge::class);
    expect($charge->charge_id)->not()->toBeNull();
    expect($charge->charge_code)->not()->toBeNull();
    expect($charge->charge_name)->not()->toBeNull();
});

test('charge factory can create fixed type charge', function () {
    $charge = Charge::factory()->fixed()->create();

    expect($charge->charge_type)->toBe(ChargeType::Fixed);
});

test('charge factory can create variable type charge', function () {
    $charge = Charge::factory()->variable()->create();

    expect($charge->charge_type)->toBe(ChargeType::Variable);
    expect($charge->default_fixed_rate_inr)->toBeNull();
});

test('charge factory can create weight based charge', function () {
    $charge = Charge::factory()->weightBased()->create();

    expect($charge->charge_type)->toBe(ChargeType::WeightBased);
});

test('charge factory can create inactive charge', function () {
    $charge = Charge::factory()->inactive()->create();

    expect($charge->is_active)->toBeFalse();
});

test('charge has relationships with uom and tax', function () {
    $charge = Charge::factory()->create();

    expect($charge->defaultUom)->toBeInstanceOf(UnitOfMeasure::class);
    expect($charge->defaultTax)->toBeInstanceOf(TaxCode::class);
});
