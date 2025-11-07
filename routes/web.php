<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\ChargeController;
use App\Http\Controllers\ContainerTypeController;
use App\Http\Controllers\CostComponentController;
use App\Http\Controllers\CourierPriceController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ForwardingPriceController;
use App\Http\Controllers\IntegrationController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PackagingPriceController;
use App\Http\Controllers\PriceComparisonController;
use App\Http\Controllers\PriceListController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\RateCardController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TaxCodeController;
use App\Http\Controllers\UnitOfMeasureController;
use App\Http\Controllers\VendorRateController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Master Data Routes
    Route::resource('items', ItemController::class);
    Route::resource('unit-of-measures', UnitOfMeasureController::class);
    Route::resource('tax-codes', TaxCodeController::class);
    Route::resource('charges', ChargeController::class);
    Route::resource('container-types', ContainerTypeController::class);
    Route::resource('suppliers', SupplierController::class);
    Route::resource('cost-components', CostComponentController::class);
    Route::resource('price-lists', PriceListController::class);

    // Shipments routes
    Route::get('shipments', [ShipmentController::class, 'index'])->name('shipments.index');
    Route::get('shipments/{shipment}', [ShipmentController::class, 'show'])->name('shipments.show');
    Route::get('shipments/export/csv', [ShipmentController::class, 'export'])->name('shipments.export');

    // Rate Cards routes
    Route::resource('rate-cards', RateCardController::class);

    // Vendor Rates Management (Rate Engine)
    Route::prefix('vendor-rates')->group(function () {
        Route::get('', [VendorRateController::class, 'index'])->name('vendor-rates.index');
        Route::get('create', [VendorRateController::class, 'create'])->name('vendor-rates.create');
        Route::post('', [VendorRateController::class, 'store'])->name('vendor-rates.store');
        Route::get('{vendorRate}', [VendorRateController::class, 'show'])->name('vendor-rates.show');
        Route::get('{vendorRate}/edit', [VendorRateController::class, 'edit'])->name('vendor-rates.edit');
        Route::patch('{vendorRate}', [VendorRateController::class, 'update'])->name('vendor-rates.update');
        Route::delete('{vendorRate}', [VendorRateController::class, 'destroy'])->name('vendor-rates.destroy');

        // API endpoints for Rate Engine
        Route::post('find-matching-costs', [VendorRateController::class, 'findMatchingCosts'])->name('vendor-rates.find-costs');
        Route::get('rates-for-charge', [VendorRateController::class, 'ratesForCharge'])->name('vendor-rates.charge-rates');
        Route::post('{vendorRate}/validate', [VendorRateController::class, 'validateRate'])->name('vendor-rates.validate');
        Route::post('{vendorRate}/calculate-cost', [VendorRateController::class, 'calculateVendorCost'])->name('vendor-rates.calculate-cost');
    });

    // Quotes routes
    Route::resource('quotes', QuoteController::class);

    // Customers routes
    Route::resource('customers', CustomerController::class);

    // Orders routes
    Route::resource('orders', OrderController::class);

    // Invoices routes
    Route::resource('invoices', InvoiceController::class);
    Route::patch('invoices/{invoice}/mark-as-sent', [InvoiceController::class, 'markAsSent'])->name('invoices.mark-as-sent');
    Route::post('invoices/{invoice}/record-payment', [InvoiceController::class, 'recordPayment'])->name('invoices.record-payment');

    // Integration routes
    Route::prefix('integrations')->group(function () {
        // Carrier Integrations
        Route::get('carriers', [IntegrationController::class, 'indexCarriers'])->name('integrations.carriers.index');
        Route::get('carriers/create', [IntegrationController::class, 'createCarrier'])->name('integrations.carriers.create');
        Route::post('carriers', [IntegrationController::class, 'storeCarrier'])->name('integrations.carriers.store');
        Route::get('carriers/{carrier}/edit', [IntegrationController::class, 'editCarrier'])->name('integrations.carriers.edit');
        Route::patch('carriers/{carrier}', [IntegrationController::class, 'updateCarrier'])->name('integrations.carriers.update');
        Route::post('carriers/{carrier}/test', [IntegrationController::class, 'testCarrier'])->name('integrations.carriers.test');
        Route::delete('carriers/{carrier}', [IntegrationController::class, 'deleteCarrier'])->name('integrations.carriers.delete');

        // Payment Gateway Integrations
        Route::get('payment-gateways', [IntegrationController::class, 'indexPaymentGateways'])->name('integrations.gateways.index');
        Route::get('payment-gateways/create', [IntegrationController::class, 'createPaymentGateway'])->name('integrations.gateways.create');
        Route::post('payment-gateways', [IntegrationController::class, 'storePaymentGateway'])->name('integrations.gateways.store');
        Route::post('payment-gateways/{gateway}/test', [IntegrationController::class, 'testPaymentGateway'])->name('integrations.gateways.test');
        Route::delete('payment-gateways/{gateway}', [IntegrationController::class, 'deletePaymentGateway'])->name('integrations.gateways.delete');

        // APIs
        Route::post('track-shipment', [IntegrationController::class, 'trackShipment'])->name('integrations.track');
        Route::post('process-payment', [IntegrationController::class, 'processPayment'])->name('integrations.payment');
    });

    // Notifications routes
    Route::prefix('notifications')->group(function () {
        Route::get('', [NotificationController::class, 'index'])->name('notifications.index');
        Route::get('preferences', [NotificationController::class, 'preferences'])->name('notifications.preferences');
        Route::patch('preferences', [NotificationController::class, 'updatePreferences'])->name('notifications.update-preferences');
        Route::patch('{notification}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-as-read');
        Route::patch('mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-as-read');
        Route::delete('{notification}', [NotificationController::class, 'delete'])->name('notifications.delete');
        Route::post('clear', [NotificationController::class, 'clear'])->name('notifications.clear');
        Route::post('test', [NotificationController::class, 'testNotification'])->name('notifications.test');
    });

    // Audit Logs routes (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
        Route::get('audit-logs/{auditLog}', [AuditLogController::class, 'show'])->name('audit-logs.show');
        Route::get('audit-logs/export/csv', [AuditLogController::class, 'export'])->name('audit-logs.export');
    });

    // Price Comparison routes
    Route::resource('price-comparisons', PriceComparisonController::class);

    // Pricing modules
    Route::resource('forwarding-prices', ForwardingPriceController::class);
    Route::resource('courier-prices', CourierPriceController::class);
    Route::resource('packaging-prices', PackagingPriceController::class);
});

require __DIR__.'/settings.php';
