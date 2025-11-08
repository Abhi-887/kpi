<?php

use App\Models\ContainerType;

test('can create a container type', function () {
    $containerType = ContainerType::factory()->create([
        'container_code' => '20GP',
        'description' => '20ft General Purpose',
    ]);

    expect($containerType)->container_type_id->toBeGreaterThan(0)
        ->and($containerType->container_code)->toBe('20GP')
        ->and($containerType->description)->toBe('20ft General Purpose')
        ->and($containerType->is_active)->toBeTrue();
});

test('container code is unique', function () {
    ContainerType::factory()->create(['container_code' => '40HC']);

    expect(fn () => ContainerType::factory()->create(['container_code' => '40HC']))
        ->toThrow(\Illuminate\Database\QueryException::class);
});

test('can update container type', function () {
    $containerType = ContainerType::factory()->create();
    $containerType->update(['description' => 'Updated description']);

    expect($containerType->description)->toBe('Updated description');
});

test('container type is inactive by default when set', function () {
    $containerType = ContainerType::factory()->create(['is_active' => false]);

    expect($containerType->is_active)->toBeFalse();
});

test('container type can have rate cards relationship', function () {
    $containerType = ContainerType::factory()->create();

    expect($containerType->rateCards())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
});

test('container type can have pricing charges relationship', function () {
    $containerType = ContainerType::factory()->create();

    expect($containerType->pricingCharges())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
});

test('can delete a container type', function () {
    $user = \App\Models\User::factory()->create();

    $containerType = ContainerType::factory()->create(['container_code' => 'DELTEST']);

    $response = $this->actingAs($user)->deleteJson(route('container-types.destroy', $containerType->container_type_id));

    $response->assertSuccessful()
        ->assertJsonPath('success', true)
        ->assertJsonPath('message', 'Container type DELTEST deleted successfully');

    $this->assertDatabaseMissing('container_types', [
        'container_type_id' => $containerType->container_type_id,
    ]);
});
