<?php

namespace Tests\Unit;

use App\Models\Charge;
use App\Models\TaxCode;
use App\Services\TaxCalculationEngine;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaxCalculationEngineTest extends TestCase
{
    use RefreshDatabase;

    private TaxCalculationEngine $taxEngine;

    protected function setUp(): void
    {
        parent::setUp();
        $this->taxEngine = new TaxCalculationEngine;
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_calculates_tax_amount_correctly(): void
    {
        // Create a tax code
        $taxCode = TaxCode::factory()->create([
            'tax_code' => 'GST-18',
            'tax_name' => '18% GST',
            'rate' => 18,
            'is_active' => true,
        ]);

        // Create a charge with this tax
        $charge = Charge::factory()->create([
            'default_tax_id' => $taxCode->id,
            'is_active' => true,
        ]);

        // Test calculation
        $salePrice = 1000;
        $result = $this->taxEngine->getTaxAmount($salePrice, $charge->id);

        $this->assertEquals(1000, $result['sale_price']);
        $this->assertEquals('GST-18', $result['tax_code']);
        $this->assertEquals(0.18, $result['tax_rate']);
        $this->assertEquals(180, $result['tax_amount']);
        $this->assertEquals(1180, $result['total_amount']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_throws_exception_if_charge_not_found(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Charge with ID 999 not found');

        $this->taxEngine->getTaxAmount(1000, 999);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_throws_exception_if_tax_is_inactive(): void
    {
        // Create inactive tax
        $taxCode = TaxCode::factory()->create([
            'is_active' => false,
        ]);

        $charge = Charge::factory()->create([
            'default_tax_id' => $taxCode->id,
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('is not active');

        $this->taxEngine->getTaxAmount(1000, $charge->id);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_calculates_batch_tax_correctly(): void
    {
        // Create tax codes
        $gst5 = TaxCode::factory()->create(['tax_code' => 'GST-5', 'rate' => 5, 'is_active' => true]);
        $gst12 = TaxCode::factory()->create(['tax_code' => 'GST-12', 'rate' => 12, 'is_active' => true]);
        $gst18 = TaxCode::factory()->create(['tax_code' => 'GST-18', 'rate' => 18, 'is_active' => true]);

        // Create charges
        $charge1 = Charge::factory()->create(['default_tax_id' => $gst5->id]);
        $charge2 = Charge::factory()->create(['default_tax_id' => $gst12->id]);
        $charge3 = Charge::factory()->create(['default_tax_id' => $gst18->id]);

        $items = [
            ['sale_price' => 1000, 'charge_id' => $charge1->id],
            ['sale_price' => 2000, 'charge_id' => $charge2->id],
            ['sale_price' => 3000, 'charge_id' => $charge3->id],
        ];

        $results = $this->taxEngine->calculateBatchTax($items);

        $this->assertCount(3, $results);

        // Check first item (5% tax)
        $this->assertEquals(1000, $results[0]['sale_price']);
        $this->assertEquals(50, $results[0]['tax_amount']);
        $this->assertEquals(1050, $results[0]['total_amount']);

        // Check second item (12% tax)
        $this->assertEquals(2000, $results[1]['sale_price']);
        $this->assertEquals(240, $results[1]['tax_amount']);
        $this->assertEquals(2240, $results[1]['total_amount']);

        // Check third item (18% tax)
        $this->assertEquals(3000, $results[2]['sale_price']);
        $this->assertEquals(540, $results[2]['tax_amount']);
        $this->assertEquals(3540, $results[2]['total_amount']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_calculates_tax_breakdown_with_totals(): void
    {
        $taxCode = TaxCode::factory()->create(['tax_code' => 'GST-18', 'rate' => 18, 'is_active' => true]);
        $charge = Charge::factory()->create(['default_tax_id' => $taxCode->id]);

        $items = [
            ['sale_price' => 1000, 'charge_id' => $charge->id],
            ['sale_price' => 2000, 'charge_id' => $charge->id],
        ];

        $breakdown = $this->taxEngine->getTaxBreakdown($items);

        $this->assertCount(2, $breakdown['items']);
        $this->assertEquals(3000, $breakdown['totals']['total_sale_price']);
        $this->assertEquals(540, $breakdown['totals']['total_tax_amount']);
        $this->assertEquals(3540, $breakdown['totals']['total_amount']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_returns_all_active_tax_codes(): void
    {
        TaxCode::factory()->count(3)->create(['is_active' => true]);
        TaxCode::factory()->create(['is_active' => false]);

        $activeTaxCodes = $this->taxEngine->getActiveTaxCodes();

        $this->assertEquals(3, $activeTaxCodes->count());
        $this->assertTrue($activeTaxCodes->every(fn ($tax) => $tax->is_active));
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_returns_all_active_charges(): void
    {
        Charge::factory()->count(3)->create(['is_active' => true]);
        Charge::factory()->create(['is_active' => false]);

        $activeCharges = $this->taxEngine->getActiveCharges();

        $this->assertEquals(3, $activeCharges->count());
        $this->assertTrue($activeCharges->every(fn ($charge) => $charge->is_active));
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_handles_zero_tax_rate(): void
    {
        $zeroTax = TaxCode::factory()->create(['tax_code' => 'GST-0', 'rate' => 0, 'is_active' => true]);
        $charge = Charge::factory()->create(['default_tax_id' => $zeroTax->id]);

        $result = $this->taxEngine->getTaxAmount(1000, $charge->id);

        $this->assertEquals(1000, $result['sale_price']);
        $this->assertEquals(0, $result['tax_amount']);
        $this->assertEquals(1000, $result['total_amount']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_handles_decimal_sale_prices(): void
    {
        $taxCode = TaxCode::factory()->create(['tax_code' => 'GST-18', 'rate' => 18, 'is_active' => true]);
        $charge = Charge::factory()->create(['default_tax_id' => $taxCode->id]);

        $result = $this->taxEngine->getTaxAmount(1234.56, $charge->id);

        $this->assertEquals(1234.56, $result['sale_price']);
        $this->assertEquals(222.22, $result['tax_amount']);
        $this->assertEquals(1456.78, $result['total_amount']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_handles_high_tax_rates(): void
    {
        $highTax = TaxCode::factory()->create(['tax_code' => 'GST-28', 'rate' => 28, 'is_active' => true]);
        $charge = Charge::factory()->create(['default_tax_id' => $highTax->id]);

        $result = $this->taxEngine->getTaxAmount(1000, $charge->id);

        $this->assertEquals(280, $result['tax_amount']);
        $this->assertEquals(1280, $result['total_amount']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_calculates_correctly_for_large_amounts(): void
    {
        $taxCode = TaxCode::factory()->create(['tax_code' => 'GST-18', 'rate' => 18, 'is_active' => true]);
        $charge = Charge::factory()->create(['default_tax_id' => $taxCode->id]);

        $result = $this->taxEngine->getTaxAmount(1000000, $charge->id);

        $this->assertEquals(1000000, $result['sale_price']);
        $this->assertEquals(180000, $result['tax_amount']);
        $this->assertEquals(1180000, $result['total_amount']);
    }
}
