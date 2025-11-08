<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Location;
use App\Models\QuotationHeader;
use App\Models\User;
use Tests\TestCase;

class QuotationCreationTest extends TestCase
{
    protected User $user;
    protected Customer $customer;
    protected Location $originPort;
    protected Location $destinationPort;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->customer = Customer::factory()->create();
        $this->originPort = Location::factory()->create(['code' => 'BOM', 'name' => 'Mumbai']);
        $this->destinationPort = Location::factory()->create(['code' => 'LAX', 'name' => 'Los Angeles']);
    }

    it('can create a new quotation with dimensions', function () {
        $this->actingAs($this->user);

        $response = $this->post('/quotations', [
            'customer_id' => $this->customer->id,
            'mode' => 'AIR',
            'movement' => 'EXPORT',
            'terms' => 'FOB',
            'origin_port_id' => $this->originPort->id,
            'destination_port_id' => $this->destinationPort->id,
            'salesperson_user_id' => null,
            'notes' => 'Test quotation',
            'dimensions' => [
                [
                    'length_cm' => 100,
                    'width_cm' => 80,
                    'height_cm' => 60,
                    'pieces' => 2,
                    'actual_weight_per_piece_kg' => 25,
                ],
            ],
        ]);

        $response->assertRedirect();
        expect(QuotationHeader::count())->toBe(1);

        $quotation = QuotationHeader::first();
        expect($quotation->quote_id)->toStartWith('Q-');
        expect($quotation->quote_status)->toBe('Draft');
        expect($quotation->customer_id)->toBe($this->customer->id);
        expect($quotation->mode)->toBe('AIR');
        expect($quotation->total_pieces)->toBe(2);
    });

    it('calculates totals correctly for air freight', function () {
        $this->actingAs($this->user);

        $this->post('/quotations', [
            'customer_id' => $this->customer->id,
            'mode' => 'AIR',
            'movement' => 'EXPORT',
            'terms' => 'FOB',
            'origin_port_id' => $this->originPort->id,
            'destination_port_id' => $this->destinationPort->id,
            'dimensions' => [
                [
                    'length_cm' => 100,
                    'width_cm' => 100,
                    'height_cm' => 100,
                    'pieces' => 1,
                    'actual_weight_per_piece_kg' => 10,
                ],
            ],
        ]);

        $quotation = QuotationHeader::first();

        // CBM = (100*100*100) / 1,000,000 = 1 CBM
        expect((float) $quotation->total_cbm)->toBe(1.0);

        // Actual weight = 10 kg
        expect((float) $quotation->total_actual_weight)->toBe(10.0);

        // Volumetric weight (AIR divisor = 167) = 1 * 167 = 167 kg
        // Chargeable weight = MAX(10, 167) = 167 kg
        expect((float) $quotation->total_chargeable_weight)->toBe(167.0);
    });

    it('calculates totals correctly for sea freight', function () {
        $this->actingAs($this->user);

        $this->post('/quotations', [
            'customer_id' => $this->customer->id,
            'mode' => 'SEA',
            'movement' => 'EXPORT',
            'terms' => 'FOB',
            'origin_port_id' => $this->originPort->id,
            'destination_port_id' => $this->destinationPort->id,
            'dimensions' => [
                [
                    'length_cm' => 200,
                    'width_cm' => 200,
                    'height_cm' => 200,
                    'pieces' => 1,
                    'actual_weight_per_piece_kg' => 5000, // 5 tons
                ],
            ],
        ]);

        $quotation = QuotationHeader::first();

        // CBM = (200*200*200) / 1,000,000 = 8 CBM
        expect((float) $quotation->total_cbm)->toBe(8.0);

        // Actual weight = 5000 kg
        expect((float) $quotation->total_actual_weight)->toBe(5000.0);

        // Volumetric weight (SEA divisor = 1000) = 8 * 1000 = 8000 kg
        // Chargeable weight = MAX(5000, 8000) = 8000 kg
        expect((float) $quotation->total_chargeable_weight)->toBe(8000.0);
    });

    it('requires customer and at least one dimension', function () {
        $this->actingAs($this->user);

        $response = $this->post('/quotations', [
            'customer_id' => '',
            'mode' => 'AIR',
            'movement' => 'EXPORT',
            'terms' => 'FOB',
            'origin_port_id' => $this->originPort->id,
            'destination_port_id' => $this->destinationPort->id,
            'dimensions' => [],
        ]);

        $response->assertSessionHasErrors(['customer_id', 'dimensions']);
        expect(QuotationHeader::count())->toBe(0);
    });

    it('only allows draft quotations to be edited', function () {
        $this->actingAs($this->user);

        $quotation = QuotationHeader::factory()->for($this->customer)->create([
            'quote_status' => 'Pending Costing',
        ]);

        $response = $this->get("/quotations/{$quotation->id}/edit");
        $response->assertStatus(302); // Redirect due to error
    });

    it('can duplicate a quotation', function () {
        $this->actingAs($this->user);

        $original = QuotationHeader::factory()
            ->for($this->customer)
            ->create(['quote_status' => 'Draft']);

        $original->dimensions()->create([
            'length_cm' => 100,
            'width_cm' => 80,
            'height_cm' => 60,
            'pieces' => 2,
            'actual_weight_per_piece_kg' => 25,
        ]);

        $response = $this->post("/quotations/{$original->id}/duplicate");

        expect(QuotationHeader::count())->toBe(2);

        $duplicate = QuotationHeader::where('id', '!=', $original->id)->first();
        expect($duplicate->quote_status)->toBe('Draft');
        expect($duplicate->dimensions()->count())->toBe(1);
        expect($duplicate->total_pieces)->toBe($original->total_pieces);
    });

    it('generates unique quote ids', function () {
        $this->actingAs($this->user);

        $this->post('/quotations', [
            'customer_id' => $this->customer->id,
            'mode' => 'AIR',
            'movement' => 'EXPORT',
            'terms' => 'FOB',
            'origin_port_id' => $this->originPort->id,
            'destination_port_id' => $this->destinationPort->id,
            'dimensions' => [['length_cm' => 100, 'width_cm' => 80, 'height_cm' => 60, 'pieces' => 1, 'actual_weight_per_piece_kg' => 10]],
        ]);

        $this->post('/quotations', [
            'customer_id' => $this->customer->id,
            'mode' => 'AIR',
            'movement' => 'EXPORT',
            'terms' => 'FOB',
            'origin_port_id' => $this->originPort->id,
            'destination_port_id' => $this->destinationPort->id,
            'dimensions' => [['length_cm' => 100, 'width_cm' => 80, 'height_cm' => 60, 'pieces' => 1, 'actual_weight_per_piece_kg' => 10]],
        ]);

        $quotes = QuotationHeader::all();
        expect($quotes->count())->toBe(2);
        expect($quotes[0]->quote_id)->not->toBe($quotes[1]->quote_id);
    });
}
