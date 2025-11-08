<?php

namespace Tests\Feature;

use Tests\TestCase;

class FormulaCalculatorControllerTest extends TestCase
{
    /**
     * CBM Endpoint Tests
     */
    public function test_calculate_cbm_endpoint_returns_success(): void
    {
        $response = $this->postJson('/formula/calculate-cbm', [
            'length' => 100,
            'width' => 100,
            'height' => 100,
            'pieces' => 1,
        ]);

        $response->assertSuccessful()
            ->assertJsonStructure([
                'success',
                'data' => ['cbm', 'calculation'],
            ])
            ->assertJsonFragment(['success' => true]);
    }

    public function test_calculate_cbm_endpoint_validates_length(): void
    {
        $response = $this->postJson('/formula/calculate-cbm', [
            'width' => 100,
            'height' => 100,
        ]);

        $response->assertStatus(422);
    }

    public function test_calculate_cbm_endpoint_validates_positive_dimensions(): void
    {
        $response = $this->postJson('/formula/calculate-cbm', [
            'length' => 0,
            'width' => 100,
            'height' => 100,
        ]);

        $response->assertStatus(422);
    }

    public function test_calculate_cbm_with_multiple_pieces(): void
    {
        $response = $this->postJson('/formula/calculate-cbm', [
            'length' => 100,
            'width' => 100,
            'height' => 100,
            'pieces' => 5,
        ]);

        $response->assertSuccessful()
            ->assertJsonFragment(['cbm' => 0.5]);
    }

    /**
     * Volumetric Weight Endpoint Tests
     */
    public function test_calculate_volumetric_weight_endpoint_returns_success(): void
    {
        $response = $this->postJson('/formula/calculate-volumetric-weight', [
            'cbm' => 5,
            'mode' => 'AIR',
        ]);

        $response->assertSuccessful()
            ->assertJsonStructure([
                'success',
                'data' => ['volumetric_weight', 'calculation'],
            ])
            ->assertJsonFragment(['success' => true, 'volumetric_weight' => 835]);
    }

    public function test_calculate_volumetric_weight_sea_lcl(): void
    {
        $response = $this->postJson('/formula/calculate-volumetric-weight', [
            'cbm' => 5,
            'mode' => 'SEA_LCL',
        ]);

        $response->assertSuccessful()
            ->assertJsonFragment(['volumetric_weight' => 5000]);
    }

    public function test_calculate_volumetric_weight_validates_cbm(): void
    {
        $response = $this->postJson('/formula/calculate-volumetric-weight', [
            'mode' => 'AIR',
        ]);

        $response->assertStatus(422);
    }

    public function test_calculate_volumetric_weight_validates_mode(): void
    {
        $response = $this->postJson('/formula/calculate-volumetric-weight', [
            'cbm' => 5,
        ]);

        $response->assertStatus(422);
    }

    public function test_calculate_volumetric_weight_rejects_invalid_mode(): void
    {
        $response = $this->postJson('/formula/calculate-volumetric-weight', [
            'cbm' => 5,
            'mode' => 'INVALID_MODE',
        ]);

        $response->assertStatus(422)
            ->assertJsonFragment(['success' => false]);
    }

    /**
     * Chargeable Weight Endpoint Tests
     */
    public function test_calculate_chargeable_weight_endpoint_returns_success(): void
    {
        $response = $this->postJson('/formula/calculate-chargeable-weight', [
            'actual_weight' => 100,
            'volumetric_weight' => 50,
        ]);

        $response->assertSuccessful()
            ->assertJsonStructure([
                'success',
                'data' => ['chargeable_weight', 'weight_type', 'calculation'],
            ])
            ->assertJsonFragment(['success' => true, 'chargeable_weight' => 100]);
    }

    public function test_calculate_chargeable_weight_returns_volumetric_when_greater(): void
    {
        $response = $this->postJson('/formula/calculate-chargeable-weight', [
            'actual_weight' => 50,
            'volumetric_weight' => 100,
        ]);

        $response->assertSuccessful()
            ->assertJsonFragment([
                'chargeable_weight' => 100,
                'weight_type' => 'Volumetric',
            ]);
    }

    public function test_calculate_chargeable_weight_validates_actual_weight(): void
    {
        $response = $this->postJson('/formula/calculate-chargeable-weight', [
            'volumetric_weight' => 50,
        ]);

        $response->assertStatus(422);
    }

    /**
     * Calculate All Endpoint Tests
     */
    public function test_calculate_all_endpoint_returns_all_metrics(): void
    {
        $response = $this->postJson('/formula/calculate-all', [
            'length' => 100,
            'width' => 100,
            'height' => 100,
            'pieces' => 1,
            'actual_weight' => 50,
            'mode' => 'AIR',
        ]);

        $response->assertSuccessful()
            ->assertJsonStructure([
                'success',
                'data' => ['cbm', 'volumetric_weight', 'chargeable_weight', 'weight_type'],
            ])
            ->assertJsonFragment(['success' => true]);
    }

    public function test_calculate_all_validates_required_fields(): void
    {
        $response = $this->postJson('/formula/calculate-all', [
            'length' => 100,
            'width' => 100,
            // Missing height and other fields
        ]);

        $response->assertStatus(422);
    }

    public function test_calculate_all_complex_scenario(): void
    {
        $response = $this->postJson('/formula/calculate-all', [
            'length' => 200,
            'width' => 150,
            'height' => 100,
            'pieces' => 3,
            'actual_weight' => 300,
            'mode' => 'SEA_LCL',
        ]);

        $response->assertSuccessful()
            ->assertJsonFragment(['success' => true])
            ->assertJsonStructure([
                'success',
                'data' => ['cbm', 'volumetric_weight', 'chargeable_weight', 'weight_type'],
            ]);
    }

    /**
     * Index Page Test
     */
    public function test_formula_engine_index_page_loads(): void
    {
        $response = $this->get('/formula-engine');

        $response->assertSuccessful();
    }
}
