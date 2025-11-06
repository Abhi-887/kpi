<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\IntegrationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\RateCardController;
use App\Http\Controllers\ShipmentController;
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

    // Shipments routes
    Route::get('shipments', [ShipmentController::class, 'index'])->name('shipments.index');
    Route::get('shipments/{shipment}', [ShipmentController::class, 'show'])->name('shipments.show');
    Route::get('shipments/export/csv', [ShipmentController::class, 'export'])->name('shipments.export');

    // Rate Cards routes
    Route::resource('rate-cards', RateCardController::class);

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
});

require __DIR__.'/settings.php';
