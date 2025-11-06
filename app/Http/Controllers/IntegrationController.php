<?php

namespace App\Http\Controllers;

use App\Models\CarrierIntegration;
use App\Models\PaymentGatewayIntegration;
use App\Services\Integrations\IntegrationFactory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class IntegrationController extends Controller
{
    // Carrier Integrations
    public function indexCarriers()
    {
        $carriers = CarrierIntegration::orderBy('created_at', 'desc')->get()->map(fn ($c) => [
            'id' => $c->id,
            'name' => $c->name,
            'carrier_type' => $c->carrier_type,
            'is_active' => $c->is_active,
            'is_test_mode' => $c->is_test_mode,
            'status_badge' => $c->status_badge,
            'last_tested_at' => $c->last_tested_at?->format('Y-m-d H:i:s'),
        ]);

        return Inertia::render('Integrations/Carriers/Index', [
            'carriers' => $carriers,
        ]);
    }

    public function createCarrier()
    {
        return Inertia::render('Integrations/Carriers/Create', [
            'carrierTypes' => ['fedex', 'ups', 'dhl', 'usps'],
        ]);
    }

    public function storeCarrier(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'carrier_type' => 'required|in:fedex,ups,dhl,usps,other',
            'api_key' => 'required|string',
            'api_secret' => 'nullable|string',
            'account_number' => 'nullable|string',
            'is_test_mode' => 'boolean',
        ]);

        $carrier = CarrierIntegration::create($validated);

        // Test connection
        try {
            $service = IntegrationFactory::getCarrierService($carrier);
            $connected = $service->testConnection();

            $carrier->update([
                'last_tested_at' => now(),
                'test_status' => $connected ? 'success' : 'failed',
                'test_message' => $connected ? 'Connection successful' : 'Connection failed',
            ]);
        } catch (\Exception $e) {
            $carrier->update([
                'last_tested_at' => now(),
                'test_status' => 'failed',
                'test_message' => $e->getMessage(),
            ]);
        }

        return redirect('/integrations/carriers')->with('success', 'Carrier integration created');
    }

    public function editCarrier(CarrierIntegration $carrier)
    {
        return Inertia::render('Integrations/Carriers/Edit', [
            'carrier' => [
                'id' => $carrier->id,
                'name' => $carrier->name,
                'carrier_type' => $carrier->carrier_type,
                'is_active' => $carrier->is_active,
                'is_test_mode' => $carrier->is_test_mode,
            ],
            'carrierTypes' => ['fedex', 'ups', 'dhl', 'usps'],
        ]);
    }

    public function updateCarrier(Request $request, CarrierIntegration $carrier)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'carrier_type' => 'required|in:fedex,ups,dhl,usps,other',
            'api_key' => 'required|string',
            'api_secret' => 'nullable|string',
            'account_number' => 'nullable|string',
            'is_test_mode' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $carrier->update($validated);

        return redirect('/integrations/carriers')->with('success', 'Carrier integration updated');
    }

    public function testCarrier(CarrierIntegration $carrier)
    {
        try {
            $service = IntegrationFactory::getCarrierService($carrier);
            $success = $service->testConnection();

            $carrier->update([
                'last_tested_at' => now(),
                'test_status' => $success ? 'success' : 'failed',
                'test_message' => $success ? 'Connection successful' : 'Connection failed',
            ]);

            return response()->json([
                'success' => $success,
                'message' => $carrier->test_message,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function deleteCarrier(CarrierIntegration $carrier)
    {
        $carrier->delete();
        return redirect('/integrations/carriers')->with('success', 'Carrier integration deleted');
    }

    // Payment Gateway Integrations
    public function indexPaymentGateways()
    {
        $gateways = PaymentGatewayIntegration::orderBy('created_at', 'desc')->get()->map(fn ($g) => [
            'id' => $g->id,
            'name' => $g->name,
            'gateway_type' => $g->gateway_type,
            'is_active' => $g->is_active,
            'is_test_mode' => $g->is_test_mode,
            'balance' => (float) $g->balance,
            'status_badge' => $g->status_badge,
            'last_tested_at' => $g->last_tested_at?->format('Y-m-d H:i:s'),
        ]);

        return Inertia::render('Integrations/PaymentGateways/Index', [
            'gateways' => $gateways,
        ]);
    }

    public function createPaymentGateway()
    {
        return Inertia::render('Integrations/PaymentGateways/Create', [
            'gatewayTypes' => ['stripe', 'paypal', 'square', 'razorpay'],
        ]);
    }

    public function storePaymentGateway(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'gateway_type' => 'required|in:stripe,paypal,square,razorpay,other',
            'public_key' => 'required|string',
            'secret_key' => 'required|string',
            'merchant_id' => 'nullable|string',
            'is_test_mode' => 'boolean',
        ]);

        $gateway = PaymentGatewayIntegration::create($validated);

        // Test connection
        try {
            $service = IntegrationFactory::getPaymentService($gateway);
            $connected = $service->testConnection();

            $gateway->update([
                'last_tested_at' => now(),
                'test_status' => $connected ? 'success' : 'failed',
                'test_message' => $connected ? 'Connection successful' : 'Connection failed',
            ]);
        } catch (\Exception $e) {
            $gateway->update([
                'last_tested_at' => now(),
                'test_status' => 'failed',
                'test_message' => $e->getMessage(),
            ]);
        }

        return redirect('/integrations/payment-gateways')->with('success', 'Payment gateway integration created');
    }

    public function testPaymentGateway(PaymentGatewayIntegration $gateway)
    {
        try {
            $service = IntegrationFactory::getPaymentService($gateway);
            $success = $service->testConnection();

            $gateway->update([
                'last_tested_at' => now(),
                'test_status' => $success ? 'success' : 'failed',
                'test_message' => $success ? 'Connection successful' : 'Connection failed',
            ]);

            return response()->json([
                'success' => $success,
                'message' => $gateway->test_message,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function deletePaymentGateway(PaymentGatewayIntegration $gateway)
    {
        $gateway->delete();
        return redirect('/integrations/payment-gateways')->with('success', 'Payment gateway integration deleted');
    }

    // Track Shipment
    public function trackShipment(Request $request)
    {
        $request->validate([
            'tracking_number' => 'required|string',
            'carrier_id' => 'required|exists:carrier_integrations,id',
        ]);

        $carrier = CarrierIntegration::findOrFail($request->carrier_id);
        $service = IntegrationFactory::getCarrierService($carrier);
        $tracking = $service->trackShipment($request->tracking_number);

        return response()->json($tracking);
    }

    // Process Payment
    public function processPayment(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|size:3',
            'gateway_id' => 'required|exists:payment_gateway_integrations,id',
            'description' => 'nullable|string',
        ]);

        $gateway = PaymentGatewayIntegration::findOrFail($request->gateway_id);
        $service = IntegrationFactory::getPaymentService($gateway);
        $result = $service->processPayment(
            $request->amount,
            $request->currency,
            $request->description
        );

        return response()->json($result);
    }
}
