<?php

use App\Models\Charge;
use App\Models\Customer;
use App\Models\Location;
use App\Models\QuotationHeader;
use App\Models\User;

describe('Quotation Module Tests', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->customer = Customer::factory()->create();
        $this->originPort = Location::factory()->create(['country' => 'India']);
        $this->destinationPort = Location::factory()->create(['country' => 'US']);
    });

    // Module 19: Quotation Creation
    describe('Module 19: Quotation Creation', function () {
        it('can display quotation creation form', function () {
            $response = $this->actingAs($this->user)
                ->get(route('quotations.create'));

            $response->assertOk();
            $response->assertInertia(fn ($page) => $page
                ->component('Quotations/Create')
                ->has('customers')
                ->has('ports')
                ->has('modes')
                ->has('movements')
                ->has('incoterms')
            );
        });

        it('can create a new quotation with dimensions', function () {
            $data = [
                'customer_id' => $this->customer->id,
                'mode' => 'AIR',
                'movement' => 'IMPORT',
                'incoterms' => 'FOB',
                'origin_port_id' => $this->originPort->id,
                'destination_port_id' => $this->destinationPort->id,
                'origin_location_id' => $this->originPort->id,
                'destination_location_id' => $this->destinationPort->id,
                'dimensions' => [
                    [
                        'length_cm' => 100,
                        'width_cm' => 50,
                        'height_cm' => 50,
                        'pieces' => 2,
                        'actual_weight_per_piece_kg' => 10,
                    ],
                    [
                        'length_cm' => 80,
                        'width_cm' => 40,
                        'height_cm' => 40,
                        'pieces' => 1,
                        'actual_weight_per_piece_kg' => 15,
                    ],
                ],
                'notes' => 'Test quotation',
            ];

            $response = $this->actingAs($this->user)
                ->postJson(route('quotations.store'), $data);

            $response->assertSuccessful();
            $response->assertJsonStructure([
                'success',
                'message',
                'quotation_id',
                'quote_id',
                'redirect',
            ]);

            $this->assertDatabaseHas('quotation_headers', [
                'customer_id' => $this->customer->id,
                'quote_status' => 'draft',
            ]);

            $this->assertDatabaseCount('quotation_dimensions', 2);
        });

        it('validates customer_id is required', function () {
            $data = [
                'mode' => 'AIR',
                'movement' => 'IMPORT',
            ];

            $response = $this->actingAs($this->user)
                ->postJson(route('quotations.store'), $data);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['customer_id']);
        });

        it('validates dimensions array is required', function () {
            $data = [
                'customer_id' => $this->customer->id,
                'mode' => 'AIR',
                'movement' => 'IMPORT',
                'incoterms' => 'FOB',
                'origin_port_id' => $this->originPort->id,
                'destination_port_id' => $this->destinationPort->id,
                'origin_location_id' => $this->originPort->id,
                'destination_location_id' => $this->destinationPort->id,
                'dimensions' => [],
            ];

            $response = $this->actingAs($this->user)
                ->postJson(route('quotations.store'), $data);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['dimensions']);
        });

        it('can show quotation details', function () {
            $quotation = QuotationHeader::factory()
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create();

            $response = $this->actingAs($this->user)
                ->get(route('quotations.show', $quotation));

            $response->assertOk();
            $response->assertInertia(fn ($page) => $page
                ->component('Quotations/Show')
                ->has('quotation')
            );
        });
    });

    // Module 22: Quotation Management
    describe('Module 22: Quotation Management', function () {
        it('can display quotation management dashboard', function () {
            QuotationHeader::factory()
                ->count(5)
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create();

            $response = $this->actingAs($this->user)
                ->get(route('quotations.index'));

            $response->assertOk();
            $response->assertInertia(fn ($page) => $page
                ->component('Quotations/Index')
                ->has('quotations.data', 5)
                ->has('statuses')
            );
        });

        it('can filter quotations by status', function () {
            QuotationHeader::factory()
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create(['quote_status' => 'draft']);

            QuotationHeader::factory()
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create(['quote_status' => 'sent']);

            $response = $this->actingAs($this->user)
                ->get(route('quotations.index', ['quote_status' => 'draft']));

            $response->assertInertia(fn ($page) => $page
                ->has('quotations.data', 1)
            );
        });

        it('can search quotations by quote_id', function () {
            $quotation = QuotationHeader::factory()
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create();

            $response = $this->actingAs($this->user)
                ->get(route('quotations.index', ['search' => $quotation->quote_id]));

            $response->assertInertia(fn ($page) => $page
                ->has('quotations.data', 1)
            );
        });

        it('can duplicate a quotation', function () {
            $quotation = QuotationHeader::factory()
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create();

            $response = $this->actingAs($this->user)
                ->postJson(route('quotations.duplicate', $quotation));

            $response->assertSuccessful()
                ->assertJsonStructure(['success', 'message', 'new_quote_id', 'redirect']);

            $this->assertDatabaseCount('quotation_headers', 2);
        });

        it('can update quotation status to won', function () {
            $quotation = QuotationHeader::factory()
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create(['quote_status' => 'sent']);

            $response = $this->actingAs($this->user)
                ->postJson(route('quotations.update-status', $quotation), ['status' => 'won']);

            $response->assertSuccessful();
            $quotation->refresh();
            $this->assertEquals('won', $quotation->quote_status);
        });

        it('can update quotation status to lost', function () {
            $quotation = QuotationHeader::factory()
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create(['quote_status' => 'sent']);

            $response = $this->actingAs($this->user)
                ->postJson(route('quotations.update-status', $quotation), ['status' => 'lost']);

            $response->assertSuccessful();
            $quotation->refresh();
            $this->assertEquals('lost', $quotation->quote_status);
        });
    });

    // Module 20: Costing & Comparison
    describe('Module 20: Costing & Comparison', function () {
        beforeEach(function () {
            $this->charges = Charge::factory()->count(3)->create();
        });

        it('can prepare quotation for costing', function () {
            $quotation = QuotationHeader::factory()
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create(['quote_status' => 'draft']);

            $response = $this->actingAs($this->user)
                ->postJson(route('quotations.prepare-for-costing', $quotation));

            $response->assertSuccessful();
            $this->assertDatabaseHas('quotation_cost_lines', [
                'quotation_header_id' => $quotation->id,
            ]);
        });

        it('can display costing comparison grid', function () {
            $quotation = QuotationHeader::factory()
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create(['quote_status' => 'pending_costing']);

            $response = $this->actingAs($this->user)
                ->get(route('quotations.costing', $quotation));

            $response->assertOk();
            $response->assertInertia(fn ($page) => $page
                ->component('Quotations/Costing')
                ->has('quotation')
                ->has('cost_lines')
            );
        });

        it('can finalize costs and move to pricing or approval', function () {
            $quotation = QuotationHeader::factory()
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create([
                    'quote_status' => 'pending_costing',
                    'total_cost_inr' => 5000, // Below approval threshold
                ]);

            $response = $this->actingAs($this->user)
                ->postJson(route('quotations.finalize-costs', $quotation));

            $response->assertSuccessful();
            $quotation->refresh();
            // Should move to pricing, not approval (cost < 10k)
            expect(in_array($quotation->quote_status, ['pending_costing', 'sent']))->toBeTrue();
        });

        it('requires approval when cost exceeds threshold', function () {
            $quotation = QuotationHeader::factory()
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create([
                    'quote_status' => 'pending_costing',
                    'total_cost_inr' => 15000, // Above approval threshold
                ]);

            $response = $this->actingAs($this->user)
                ->postJson(route('quotations.finalize-costs', $quotation));

            $response->assertSuccessful();
            $quotation->refresh();
            // Should move to approval (cost > 10k)
            $this->assertEquals('pending_approval', $quotation->quote_status);
        });
    });

    // Module 21: Quotation Builder (Pricing)
    describe('Module 21: Quotation Builder (Pricing)', function () {
        it('can display pricing builder', function () {
            $quotation = QuotationHeader::factory()
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create(['quote_status' => 'pending_costing']);

            $response = $this->actingAs($this->user)
                ->get(route('quotations.pricing', $quotation));

            $response->assertOk();
            $response->assertInertia(fn ($page) => $page
                ->component('Quotations/Pricing')
                ->has('quotation')
                ->has('pricing_summary')
            );
        });

        it('can update sale price with override', function () {
            $quotation = QuotationHeader::factory()
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create(['quote_status' => 'pending_costing']);

            $saleLine = $quotation->saleLines()->create([
                'charge_id' => Charge::factory()->create()->id,
                'quantity' => 1,
                'unit_sale_rate' => 1000,
                'total_sale_price_inr' => 1000,
            ]);

            $response = $this->actingAs($this->user)
                ->patchJson(route('sale-lines.update-price', $saleLine), [
                    'sale_price_inr' => 1500,
                ]);

            $response->assertSuccessful();
            $saleLine->refresh();
            $this->assertEquals(1500, $saleLine->total_sale_price_inr);
        });

        it('can finalize pricing and send quotation', function () {
            $quotation = QuotationHeader::factory()
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create(['quote_status' => 'pending_costing']);

            $response = $this->actingAs($this->user)
                ->postJson(route('quotations.finalize-pricing', $quotation));

            $response->assertSuccessful();
            $quotation->refresh();
            $this->assertEquals('sent', $quotation->quote_status);
        });
    });

    // Module 23: Quotation Approval
    describe('Module 23: Quotation Approval', function () {
        it('can display approval dashboard', function () {
            QuotationHeader::factory()
                ->count(3)
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create(['quote_status' => 'pending_approval']);

            $response = $this->actingAs($this->user)
                ->get(route('quotations.approval.index'));

            $response->assertOk();
            $response->assertInertia(fn ($page) => $page
                ->component('Quotations/ApprovalDashboard')
                ->has('pending_approvals.data', 3)
            );
        });

        it('can show quotation for approval review', function () {
            $quotation = QuotationHeader::factory()
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create(['quote_status' => 'pending_approval']);

            $quotation->approval()->create([
                'submitted_by_user_id' => $this->user->id,
            ]);

            $response = $this->actingAs($this->user)
                ->get(route('quotations.approval.show', $quotation));

            $response->assertOk();
            $response->assertInertia(fn ($page) => $page
                ->component('Quotations/ApprovalReview')
                ->has('quotation')
                ->has('summary')
                ->has('approval')
            );
        });

        it('can approve quotation', function () {
            $quotation = QuotationHeader::factory()
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create(['quote_status' => 'pending_approval']);

            $quotation->approval()->create([
                'submitted_by_user_id' => $this->user->id,
            ]);

            $response = $this->actingAs($this->user)
                ->postJson(route('quotations.approval.approve', $quotation), [
                    'comments' => 'Approved as per policy',
                ]);

            $response->assertSuccessful();
            $quotation->refresh();
            $this->assertEquals('sent', $quotation->quote_status);
            $this->assertEquals('approved', $quotation->approval->approval_status);
        });

        it('can reject quotation with reason', function () {
            $quotation = QuotationHeader::factory()
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create(['quote_status' => 'pending_approval']);

            $quotation->approval()->create([
                'submitted_by_user_id' => $this->user->id,
            ]);

            $response = $this->actingAs($this->user)
                ->postJson(route('quotations.approval.reject', $quotation), [
                    'rejection_reason' => 'Margin too low',
                ]);

            $response->assertSuccessful();
            $quotation->refresh();
            $this->assertEquals('draft', $quotation->quote_status);
            $this->assertEquals('rejected', $quotation->approval->approval_status);
            $this->assertEquals('Margin too low', $quotation->approval->rejected_reason);
        });

        it('requires rejection reason when rejecting', function () {
            $quotation = QuotationHeader::factory()
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create(['quote_status' => 'pending_approval']);

            $quotation->approval()->create([
                'submitted_by_user_id' => $this->user->id,
            ]);

            $response = $this->actingAs($this->user)
                ->postJson(route('quotations.approval.reject', $quotation), []);

            $response->assertUnprocessable();
        });
    });

    // Integration Tests
    describe('Full Quotation Workflow', function () {
        it('completes full quotation workflow from creation to approval', function () {
            // Step 1: Create quotation
            $createData = [
                'customer_id' => $this->customer->id,
                'mode' => 'AIR',
                'movement' => 'IMPORT',
                'incoterms' => 'FOB',
                'origin_port_id' => $this->originPort->id,
                'destination_port_id' => $this->destinationPort->id,
                'origin_location_id' => $this->originPort->id,
                'destination_location_id' => $this->destinationPort->id,
                'dimensions' => [
                    [
                        'length_cm' => 100,
                        'width_cm' => 50,
                        'height_cm' => 50,
                        'pieces' => 2,
                        'actual_weight_per_piece_kg' => 10,
                    ],
                ],
                'notes' => 'Test quotation',
            ];

            $response = $this->actingAs($this->user)
                ->postJson(route('quotations.store'), $createData);

            $response->assertSuccessful();
            $quotationId = $response->json('quotation_id');
            $quotation = QuotationHeader::find($quotationId);
            $this->assertEquals('draft', $quotation->quote_status);

            // Step 2: Prepare for costing
            $response = $this->actingAs($this->user)
                ->postJson(route('quotations.prepare-for-costing', $quotation));

            $response->assertSuccessful();
            $this->assertGreaterThan(0, $quotation->costLines()->count());

            // Step 3: Finalize costs
            $response = $this->actingAs($this->user)
                ->postJson(route('quotations.finalize-costs', $quotation));

            $response->assertSuccessful();
            $quotation->refresh();
            $this->assertIn($quotation->quote_status, ['pending_approval', 'pending_costing']);
        });

        it('completes quotation workflow for high-value quote requiring approval', function () {
            $quotation = QuotationHeader::factory()
                ->for($this->customer)
                ->for($this->user, 'createdBy')
                ->create([
                    'quote_status' => 'pending_costing',
                    'total_cost_inr' => 15000,
                ]);

            // Move to approval
            $response = $this->actingAs($this->user)
                ->postJson(route('quotations.finalize-costs', $quotation));

            $quotation->refresh();
            $this->assertEquals('pending_approval', $quotation->quote_status);

            // Approve
            $quotation->approval()->create(['submitted_by_user_id' => $this->user->id]);

            $response = $this->actingAs($this->user)
                ->postJson(route('quotations.approval.approve', $quotation), [
                    'comments' => 'Approved',
                ]);

            $response->assertSuccessful();
            $quotation->refresh();
            $this->assertEquals('sent', $quotation->quote_status);
        });
    });
});
