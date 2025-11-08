<?php

namespace Tests\Unit;

use App\Services\FormulaEngine;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class FormulaEngineTest extends TestCase
{
    private FormulaEngine $formulaEngine;

    protected function setUp(): void
    {
        parent::setUp();
        $this->formulaEngine = new FormulaEngine;
    }

    /**
     * CBM Calculation Tests
     */
    public function test_calculate_cbm_basic(): void
    {
        $cbm = $this->formulaEngine->calculateCBM(100, 100, 100, 1);

        $expected = (100 * 100 * 100 * 1) / 1_000_000;
        $this->assertEquals($expected, $cbm);
    }

    public function test_calculate_cbm_with_multiple_pieces(): void
    {
        $cbm = $this->formulaEngine->calculateCBM(100, 100, 100, 5);

        $expected = (100 * 100 * 100 * 5) / 1_000_000;
        $this->assertEquals($expected, $cbm);
    }

    public function test_calculate_cbm_with_fractional_dimensions(): void
    {
        $cbm = $this->formulaEngine->calculateCBM(50.5, 40.3, 30.2, 2);

        $expected = (50.5 * 40.3 * 30.2 * 2) / 1_000_000;
        $this->assertEqualsWithDelta($expected, $cbm, 0.000001);
    }

    public function test_calculate_cbm_throws_on_negative_length(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->formulaEngine->calculateCBM(-10, 100, 100, 1);
    }

    public function test_calculate_cbm_throws_on_zero_width(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->formulaEngine->calculateCBM(100, 0, 100, 1);
    }

    public function test_calculate_cbm_throws_on_negative_pieces(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->formulaEngine->calculateCBM(100, 100, 100, 0);
    }

    /**
     * Volumetric Weight Calculation Tests
     */
    public function test_calculate_volumetric_weight_air(): void
    {
        $volumetricWeight = $this->formulaEngine->calculateVolumetricWeight(5, 'AIR');

        $this->assertEquals(835, $volumetricWeight);
    }

    public function test_calculate_volumetric_weight_sea_lcl(): void
    {
        $volumetricWeight = $this->formulaEngine->calculateVolumetricWeight(5, 'SEA_LCL');

        $this->assertEquals(5000, $volumetricWeight);
    }

    public function test_calculate_volumetric_weight_sea_fcl(): void
    {
        $volumetricWeight = $this->formulaEngine->calculateVolumetricWeight(5, 'SEA_FCL');

        $this->assertEquals(5000, $volumetricWeight);
    }

    public function test_calculate_volumetric_weight_rail(): void
    {
        $volumetricWeight = $this->formulaEngine->calculateVolumetricWeight(5, 'RAIL');

        $this->assertEquals(1665, $volumetricWeight);
    }

    public function test_calculate_volumetric_weight_road(): void
    {
        $volumetricWeight = $this->formulaEngine->calculateVolumetricWeight(5, 'ROAD');

        $this->assertEquals(2500, $volumetricWeight);
    }

    public function test_calculate_volumetric_weight_lowercase_mode(): void
    {
        $volumetricWeight = $this->formulaEngine->calculateVolumetricWeight(5, 'air');

        $this->assertEquals(835, $volumetricWeight);
    }

    public function test_calculate_volumetric_weight_zero_cbm(): void
    {
        $volumetricWeight = $this->formulaEngine->calculateVolumetricWeight(0, 'AIR');

        $this->assertEquals(0, $volumetricWeight);
    }

    public function test_calculate_volumetric_weight_throws_on_negative_cbm(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->formulaEngine->calculateVolumetricWeight(-5, 'AIR');
    }

    public function test_calculate_volumetric_weight_throws_on_invalid_mode(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->formulaEngine->calculateVolumetricWeight(5, 'INVALID_MODE');
    }

    /**
     * Chargeable Weight Tests
     */
    public function test_get_chargeable_weight_returns_actual_when_greater(): void
    {
        $chargeableWeight = $this->formulaEngine->getChargeableWeight(100, 50);

        $this->assertEquals(100, $chargeableWeight);
    }

    public function test_get_chargeable_weight_returns_volumetric_when_greater(): void
    {
        $chargeableWeight = $this->formulaEngine->getChargeableWeight(50, 100);

        $this->assertEquals(100, $chargeableWeight);
    }

    public function test_get_chargeable_weight_returns_equal_when_same(): void
    {
        $chargeableWeight = $this->formulaEngine->getChargeableWeight(100, 100);

        $this->assertEquals(100, $chargeableWeight);
    }

    public function test_get_chargeable_weight_with_zero_actual(): void
    {
        $chargeableWeight = $this->formulaEngine->getChargeableWeight(0, 100);

        $this->assertEquals(100, $chargeableWeight);
    }

    public function test_get_chargeable_weight_throws_on_negative_actual(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->formulaEngine->getChargeableWeight(-10, 50);
    }

    public function test_get_chargeable_weight_throws_on_negative_volumetric(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->formulaEngine->getChargeableWeight(100, -50);
    }

    /**
     * Calculate All Tests
     */
    public function test_calculate_all_returns_all_metrics(): void
    {
        $result = $this->formulaEngine->calculateAll([
            'length' => 100,
            'width' => 100,
            'height' => 100,
            'pieces' => 1,
            'actual_weight' => 50,
            'mode' => 'AIR',
        ]);

        $this->assertArrayHasKey('cbm', $result);
        $this->assertArrayHasKey('volumetric_weight', $result);
        $this->assertArrayHasKey('chargeable_weight', $result);
        $this->assertArrayHasKey('weight_type', $result);
    }

    public function test_calculate_all_with_volumetric_greater_than_actual(): void
    {
        $result = $this->formulaEngine->calculateAll([
            'length' => 200,
            'width' => 200,
            'height' => 200,
            'pieces' => 2,
            'actual_weight' => 50,
            'mode' => 'AIR',
        ]);

        $this->assertEquals('volumetric', $result['weight_type']);
        $this->assertEquals($result['chargeable_weight'], $result['volumetric_weight']);
    }

    public function test_calculate_all_with_actual_greater_than_volumetric(): void
    {
        $result = $this->formulaEngine->calculateAll([
            'length' => 100,
            'width' => 100,
            'height' => 100,
            'pieces' => 1,
            'actual_weight' => 500,
            'mode' => 'AIR',
        ]);

        $this->assertEquals('actual', $result['weight_type']);
        $this->assertEquals($result['chargeable_weight'], 500);
    }

    /**
     * Supported Modes Tests
     */
    public function test_get_supported_modes_returns_array(): void
    {
        $modes = $this->formulaEngine->getSupportedModes();

        $this->assertIsArray($modes);
        $this->assertNotEmpty($modes);
    }

    public function test_get_supported_modes_includes_air(): void
    {
        $modes = $this->formulaEngine->getSupportedModes();

        $this->assertArrayHasKey('AIR', $modes);
        $this->assertArrayHasKey('name', $modes['AIR']);
        $this->assertArrayHasKey('factor', $modes['AIR']);
        $this->assertArrayHasKey('divisor', $modes['AIR']);
        $this->assertEquals(167, $modes['AIR']['factor']);
        $this->assertEquals(6000, $modes['AIR']['divisor']);
    }

    public function test_get_supported_modes_includes_sea_modes(): void
    {
        $modes = $this->formulaEngine->getSupportedModes();

        $this->assertArrayHasKey('SEA_LCL', $modes);
        $this->assertArrayHasKey('SEA_FCL', $modes);
        $this->assertEquals(1000, $modes['SEA_LCL']['factor']);
        $this->assertEquals(1000, $modes['SEA_FCL']['factor']);
    }
}
