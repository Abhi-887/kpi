<?php

namespace Tests\Feature;

use App\Models\Charge;
use App\Models\TaxCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaxCalculationEngineControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_displays_tax_engine_index(): void
    {
        $taxCode = TaxCode::factory()->create(['is_active' => true]);
        $charge = Charge::factory()->create(['default_tax_id' => $taxCode->id, 'is_active' => true]);

        $response = $this->actingAs($this->user)->get('/tax-engine');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('TaxCalculationEngine/Index')
            ->has('charges', 1)
            ->has('taxCodes', 1)
        );
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_calculates_single_tax(): void
    {
        $taxCode = TaxCode::factory()->create([
            'tax_code' => 'GST-18',
            'rate' => 18,
            'is_active' => true,
        ]);
        $charge = Charge::factory()->create(['default_tax_id' => $taxCode->id]);

        $response = $this->actingAs($this->user)->postJson('/tax-engine/calculate', [
            'sale_price' => 1000,
            'charge_id' => $charge->id,
        ]);

        $response->assertSuccessful();
        $response->assertJson([
            'success' => true,
            'error' => null,
            'data' => [
                'sale_price' => 1000,
                'tax_code' => 'GST-18',
                'tax_amount' => 180,
                'total_amount' => 1180,
            ],
        ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_handles_validation_errors_gracefully(): void
    {
        $response = $this->actingAs($this->user)->postJson('/tax-engine/calculate', [
            'sale_price' => 'invalid',
            'charge_id' => 'invalid',
        ]);

        $response->assertUnprocessable();
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_returns_error_on_missing_sale_price(): void
    {
        $charge = Charge::factory()->create();

        $response = $this->actingAs($this->user)->postJson('/tax-engine/calculate', [
            'charge_id' => $charge->id,
        ]);

        $response->assertUnprocessable();
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_returns_error_on_negative_sale_price(): void
    {
        $charge = Charge::factory()->create();

        $response = $this->actingAs($this->user)->postJson('/tax-engine/calculate', [
            'sale_price' => -100,
            'charge_id' => $charge->id,
        ]);

        $response->assertUnprocessable();
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_returns_error_on_invalid_charge_id(): void
    {
        $response = $this->actingAs($this->user)->postJson('/tax-engine/calculate', [
            'sale_price' => 1000,
            'charge_id' => 999,
        ]);

        $response->assertUnprocessable();
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_calculates_batch_tax(): void
    {
        $gst5 = TaxCode::factory()->create(['tax_code' => 'GST-5', 'rate' => 5, 'is_active' => true]);
        $gst18 = TaxCode::factory()->create(['tax_code' => 'GST-18', 'rate' => 18, 'is_active' => true]);

        $charge1 = Charge::factory()->create(['default_tax_id' => $gst5->id]);
        $charge2 = Charge::factory()->create(['default_tax_id' => $gst18->id]);

        $response = $this->actingAs($this->user)->postJson('/tax-engine/calculate-batch', [
            'items' => [
                ['sale_price' => 1000, 'charge_id' => $charge1->id],
                ['sale_price' => 2000, 'charge_id' => $charge2->id],
            ],
        ]);

        $response->assertSuccessful();
        $response->assertJson([
            'success' => true,
            'error' => null,
        ]);

        $data = $response->json('data');
        $this->assertCount(2, $data['items']);
        $this->assertEquals(3000, $data['totals']['total_sale_price']);
        $this->assertEquals(410, $data['totals']['total_tax_amount']);
        $this->assertEquals(3410, $data['totals']['total_amount']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_validates_batch_items_required(): void
    {
        $response = $this->actingAs($this->user)->postJson('/tax-engine/calculate-batch', [
            'items' => [],
        ]);

        $response->assertUnprocessable();
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_validates_batch_items_structure_gracefully(): void
    {
        $response = $this->actingAs($this->user)->postJson('/tax-engine/calculate-batch', [
            'items' => [
                ['invalid' => 'structure'],
            ],
        ]);

        $response->assertUnprocessable();
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_returns_error_on_missing_batch_items(): void
    {
        $response = $this->actingAs($this->user)->postJson('/tax-engine/calculate-batch', []);

        $response->assertUnprocessable();
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_handles_decimal_amounts_in_batch(): void
    {
        $taxCode = TaxCode::factory()->create(['tax_code' => 'GST-18', 'rate' => 18, 'is_active' => true]);
        $charge = Charge::factory()->create(['default_tax_id' => $taxCode->id]);

        $response = $this->actingAs($this->user)->postJson('/tax-engine/calculate-batch', [
            'items' => [
                ['sale_price' => 1234.56, 'charge_id' => $charge->id],
                ['sale_price' => 5678.90, 'charge_id' => $charge->id],
            ],
        ]);

        $response->assertSuccessful();
        $data = $response->json('data');
        $this->assertEquals(6913.46, $data['totals']['total_sale_price']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_requires_authentication(): void
    {
        $response = $this->get('/tax-engine');

        $response->assertRedirect('/login');
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_calculates_zero_tax_correctly(): void
    {
        $zeroTax = TaxCode::factory()->create(['tax_code' => 'GST-0', 'rate' => 0, 'is_active' => true]);
        $charge = Charge::factory()->create(['default_tax_id' => $zeroTax->id]);

        $response = $this->actingAs($this->user)->postJson('/tax-engine/calculate', [
            'sale_price' => 1000,
            'charge_id' => $charge->id,
        ]);

        $response->assertSuccessful();
        $response->assertJson([
            'success' => true,
            'data' => [
                'tax_amount' => 0,
                'total_amount' => 1000,
            ],
        ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_handles_large_batch_calculations(): void
    {
        $taxCode = TaxCode::factory()->create(['tax_code' => 'GST-18', 'rate' => 18, 'is_active' => true]);
        $charge = Charge::factory()->create(['default_tax_id' => $taxCode->id]);

        $items = array_fill(0, 50, ['sale_price' => 1000, 'charge_id' => $charge->id]);

        $response = $this->actingAs($this->user)->postJson('/tax-engine/calculate-batch', [
            'items' => $items,
        ]);

        $response->assertSuccessful();
        $data = $response->json('data');
        $this->assertCount(50, $data['items']);
        $this->assertEquals(50000, $data['totals']['total_sale_price']);
        $this->assertEquals(9000, $data['totals']['total_tax_amount']);
    }
}
