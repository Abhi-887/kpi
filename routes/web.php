<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\InvoiceController;
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
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

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
});

require __DIR__.'/settings.php';
