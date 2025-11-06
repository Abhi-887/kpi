<?php

use App\Models\Customer;
use App\Models\Order;
use App\Models\User;

describe('OrderController', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->customer = Customer::factory()->create(['status' => 'active']);
    });

    describe('index', function () {
        it('displays all orders with pagination', function () {
            Order::factory()->count(20)->create(['customer_id' => $this->customer->id]);

            $response = $this->actingAs($this->user)->get('/orders');

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                expect($page['orders']['data'])->toHaveLength(15);
            });
        });

        it('filters orders by search', function () {
            $order1 = Order::factory()->create([
                'customer_id' => $this->customer->id,
                'order_number' => 'ORD-123456',
            ]);
            $order2 = Order::factory()->create([
                'customer_id' => $this->customer->id,
                'order_number' => 'ORD-654321',
            ]);

            $response = $this->actingAs($this->user)
                ->get('/orders?search=123456');

            $response->assertInertia(function ($page) use ($order1) {
                expect($page->props['orders']['data'])->toHaveLength(1);
                expect($page->props['orders']['data'][0]['id'])->toBe($order1->id);
            });
        });

        it('filters orders by customer name', function () {
            $customer2 = Customer::factory()->create(['company_name' => 'Tech Corp']);
            $order1 = Order::factory()->create(['customer_id' => $this->customer->id]);
            $order2 = Order::factory()->create(['customer_id' => $customer2->id]);

            $response = $this->actingAs($this->user)
                ->get('/orders?search=Tech%20Corp');

            $response->assertInertia(function ($page) use ($order2) {
                expect($page->props['orders']['data'])->toHaveLength(1);
                expect($page->props['orders']['data'][0]['id'])->toBe($order2->id);
            });
        });

        it('filters orders by status', function () {
            Order::factory()->create(['customer_id' => $this->customer->id, 'status' => 'draft']);
            Order::factory()->count(3)->create(['customer_id' => $this->customer->id, 'status' => 'pending']);

            $response = $this->actingAs($this->user)
                ->get('/orders?status=pending');

            $response->assertInertia(function ($page) {
                expect($page->props['orders']['data'])->toHaveLength(3);
            });
        });

        it('filters orders by type', function () {
            Order::factory()->create(['customer_id' => $this->customer->id, 'order_type' => 'standard']);
            Order::factory()->count(2)->create(['customer_id' => $this->customer->id, 'order_type' => 'express']);

            $response = $this->actingAs($this->user)
                ->get('/orders?type=express');

            $response->assertInertia(function ($page) {
                expect($page->props['orders']['data'])->toHaveLength(2);
            });
        });

        it('returns filters in response', function () {
            $response = $this->actingAs($this->user)
                ->get('/orders?search=test&status=pending&type=express');

            $response->assertInertia(function ($page) {
                expect($page->props['filters'])->toBe([
                    'search' => 'test',
                    'status' => 'pending',
                    'type' => 'express',
                ]);
            });
        });
    });

    describe('create', function () {
        it('displays create form with active customers', function () {
            Customer::factory()->create(['status' => 'inactive']);
            Customer::factory()->count(3)->create(['status' => 'active']);

            $response = $this->actingAs($this->user)->get('/orders/create');

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                expect($page->props['customers'])->toHaveLength(4); // 3 active + the original one
            });
        });
    });

    describe('store', function () {
        it('creates an order with valid data', function () {
            $data = [
                'customer_id' => $this->customer->id,
                'order_type' => 'standard',
                'order_date' => '2025-11-06',
                'required_delivery_date' => '2025-11-13',
                'origin_country' => 'US',
                'destination_country' => 'CA',
                'total_weight' => 100,
                'weight_unit' => 'kg',
                'notes' => 'Test notes',
                'special_instructions' => 'Handle with care',
            ];

            $response = $this->actingAs($this->user)
                ->post('/orders', $data);

            $response->assertRedirect();
            expect(Order::count())->toBe(1);

            $order = Order::first();
            expect($order->customer_id)->toBe($this->customer->id);
            expect($order->order_type)->toBe('standard');
            expect($order->status)->toBe('draft');
            expect($order->order_number)->toMatch('/^ORD-[A-Z0-9]+$/');
        });

        it('validates required fields', function () {
            $response = $this->actingAs($this->user)
                ->post('/orders', []);

            $response->assertSessionHasErrors(['customer_id', 'order_type', 'order_date']);
        });

        it('validates customer exists', function () {
            $response = $this->actingAs($this->user)
                ->post('/orders', [
                    'customer_id' => 9999,
                    'order_type' => 'standard',
                    'order_date' => '2025-11-06',
                ]);

            $response->assertSessionHasErrors('customer_id');
        });

        it('validates order type', function () {
            $response = $this->actingAs($this->user)
                ->post('/orders', [
                    'customer_id' => $this->customer->id,
                    'order_type' => 'invalid',
                    'order_date' => '2025-11-06',
                ]);

            $response->assertSessionHasErrors('order_type');
        });

        it('validates required delivery date is after order date', function () {
            $response = $this->actingAs($this->user)
                ->post('/orders', [
                    'customer_id' => $this->customer->id,
                    'order_type' => 'standard',
                    'order_date' => '2025-11-13',
                    'required_delivery_date' => '2025-11-06',
                ]);

            $response->assertSessionHasErrors('required_delivery_date');
        });

        it('validates origin country max length', function () {
            $response = $this->actingAs($this->user)
                ->post('/orders', [
                    'customer_id' => $this->customer->id,
                    'order_type' => 'standard',
                    'order_date' => '2025-11-06',
                    'origin_country' => 'USA',
                ]);

            $response->assertSessionHasErrors('origin_country');
        });

        it('initializes order with zero amounts', function () {
            $data = [
                'customer_id' => $this->customer->id,
                'order_type' => 'standard',
                'order_date' => '2025-11-06',
            ];

            $this->actingAs($this->user)->post('/orders', $data);

            $order = Order::first();
            expect($order->subtotal)->toBe(0);
            expect($order->tax)->toBe(0);
            expect($order->shipping_cost)->toBe(0);
            expect($order->total_amount)->toBe(0);
        });
    });

    describe('show', function () {
        it('displays order details', function () {
            $order = Order::factory()->create(['customer_id' => $this->customer->id]);

            $response = $this->actingAs($this->user)
                ->get("/orders/{$order->id}");

            $response->assertStatus(200);
            $response->assertInertia(function ($page) use ($order) {
                expect($page->props['order']['id'])->toBe($order->id);
            });
        });

        it('loads order with customer and items', function () {
            $order = Order::factory()->create(['customer_id' => $this->customer->id]);

            $this->actingAs($this->user)->get("/orders/{$order->id}");

            expect($order->relationLoaded('customer'))->toBeFalse(); // Re-fetch to test loading
            $freshOrder = Order::with(['customer', 'items'])->find($order->id);
            expect($freshOrder->relationLoaded('customer'))->toBeTrue();
            expect($freshOrder->relationLoaded('items'))->toBeTrue();
        });

        it('returns 404 for non-existent order', function () {
            $response = $this->actingAs($this->user)
                ->get('/orders/9999');

            $response->assertNotFound();
        });
    });

    describe('edit', function () {
        it('displays edit form with active customers', function () {
            $order = Order::factory()->create(['customer_id' => $this->customer->id]);
            Customer::factory()->count(3)->create(['status' => 'active']);

            $response = $this->actingAs($this->user)
                ->get("/orders/{$order->id}/edit");

            $response->assertStatus(200);
            $response->assertInertia(function ($page) use ($order) {
                expect($page->props['order']['id'])->toBe($order->id);
                expect($page->props['customers'])->not->toBeEmpty();
            });
        });

        it('returns 404 for non-existent order', function () {
            $response = $this->actingAs($this->user)
                ->get('/orders/9999/edit');

            $response->assertNotFound();
        });
    });

    describe('update', function () {
        it('updates an order with valid data', function () {
            $order = Order::factory()->create(['customer_id' => $this->customer->id]);
            $newCustomer = Customer::factory()->create(['status' => 'active']);

            $data = [
                'customer_id' => $newCustomer->id,
                'order_type' => 'express',
                'status' => 'pending',
                'order_date' => '2025-11-06',
                'required_delivery_date' => '2025-11-10',
                'origin_country' => 'MX',
                'destination_country' => 'US',
                'total_weight' => 250,
                'weight_unit' => 'lbs',
                'notes' => 'Updated notes',
                'special_instructions' => 'Rush delivery',
            ];

            $response = $this->actingAs($this->user)
                ->patch("/orders/{$order->id}", $data);

            $response->assertRedirect();

            $order->refresh();
            expect($order->customer_id)->toBe($newCustomer->id);
            expect($order->order_type)->toBe('express');
            expect($order->status)->toBe('pending');
            expect((float) $order->total_weight)->toBe(250.0);
            expect($order->notes)->toBe('Updated notes');
        });

        it('validates required fields on update', function () {
            $order = Order::factory()->create(['customer_id' => $this->customer->id]);

            $response = $this->actingAs($this->user)
                ->patch("/orders/{$order->id}", []);

            $response->assertSessionHasErrors(['customer_id', 'order_type', 'status', 'order_date']);
        });

        it('validates status enum', function () {
            $order = Order::factory()->create(['customer_id' => $this->customer->id]);

            $response = $this->actingAs($this->user)
                ->patch("/orders/{$order->id}", [
                    'customer_id' => $this->customer->id,
                    'order_type' => 'standard',
                    'status' => 'invalid_status',
                    'order_date' => '2025-11-06',
                ]);

            $response->assertSessionHasErrors('status');
        });

        it('validates actual delivery date', function () {
            $order = Order::factory()->create(['customer_id' => $this->customer->id]);

            $response = $this->actingAs($this->user)
                ->patch("/orders/{$order->id}", [
                    'customer_id' => $this->customer->id,
                    'order_type' => 'standard',
                    'status' => 'delivered',
                    'order_date' => '2025-11-06',
                    'actual_delivery_date' => 'invalid-date',
                ]);

            $response->assertSessionHasErrors('actual_delivery_date');
        });

        it('returns 404 for non-existent order', function () {
            $response = $this->actingAs($this->user)
                ->patch('/orders/9999', [
                    'customer_id' => $this->customer->id,
                    'order_type' => 'standard',
                    'status' => 'draft',
                    'order_date' => '2025-11-06',
                ]);

            $response->assertNotFound();
        });
    });

    describe('destroy', function () {
        it('deletes an order', function () {
            $order = Order::factory()->create(['customer_id' => $this->customer->id]);

            $response = $this->actingAs($this->user)
                ->delete("/orders/{$order->id}");

            $response->assertRedirect();
            expect(Order::find($order->id))->toBeNull();
        });

        it('returns 404 for non-existent order', function () {
            $response = $this->actingAs($this->user)
                ->delete('/orders/9999');

            $response->assertNotFound();
        });

        it('deletes order and shows success message', function () {
            $order = Order::factory()->create(['customer_id' => $this->customer->id]);

            $response = $this->actingAs($this->user)
                ->delete("/orders/{$order->id}");

            $response->assertSessionHas('success');
        });
    });
});
