<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\ChargeController;
use App\Http\Controllers\ChargeRuleController;
use App\Http\Controllers\ContainerTypeController;
use App\Http\Controllers\CostComponentController;
use App\Http\Controllers\CourierPriceController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExchangeRateController;
use App\Http\Controllers\FormulaCalculatorController;
use App\Http\Controllers\ForwardingPriceController;
use App\Http\Controllers\IntegrationController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\MarginRuleController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PackagingPriceController;
use App\Http\Controllers\PriceComparisonController;
use App\Http\Controllers\PriceListController;
use App\Http\Controllers\QuotationApprovalController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\RateCardController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TaxCalculationEngineController;
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
    Route::resource('ports', LocationController::class);
    Route::post('ports/bulk-import', [LocationController::class, 'bulkImport'])->name('ports.bulk-import');
    Route::resource('suppliers', SupplierController::class);
    Route::resource('cost-components', CostComponentController::class);
    Route::resource('price-lists', PriceListController::class);

    // Exchange Rates Management (admin only)
    Route::middleware('role:admin')->prefix('exchange-rates')->group(function () {
        Route::get('', [ExchangeRateController::class, 'index'])->name('exchange-rates.index');
        Route::get('create', [ExchangeRateController::class, 'create'])->name('exchange-rates.create');
        Route::post('', [ExchangeRateController::class, 'store'])->name('exchange-rates.store');
        Route::get('history/{fromCurrency}/{toCurrency}', [ExchangeRateController::class, 'history'])->name('exchange-rates.history');
        Route::delete('{exchangeRate}', [ExchangeRateController::class, 'destroy'])->name('exchange-rates.destroy');

        // API endpoints
        Route::get('api/show', [ExchangeRateController::class, 'show'])->name('exchange-rates.show');
        Route::get('api/rates', [ExchangeRateController::class, 'getRates'])->name('exchange-rates.rates');
        Route::post('api/convert', [ExchangeRateController::class, 'convert'])->name('exchange-rates.convert');
        Route::post('api/destroy-pair', [ExchangeRateController::class, 'destroyPair'])->name('exchange-rates.destroy-pair');
    });

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

    // Charge Applicability Engine (Charge Rules Management)
    Route::prefix('charge-applicability')->group(function () {
        Route::get('', [ChargeRuleController::class, 'index'])->name('charge-applicability.index');

        // API endpoints for Charge Engine
        Route::post('get-rules', [ChargeRuleController::class, 'getRulesForCombination'])->name('charge-applicability.get-rules');
        Route::post('add-charge', [ChargeRuleController::class, 'addChargeToRules'])->name('charge-applicability.add-charge');
        Route::post('remove-charge', [ChargeRuleController::class, 'removeChargeFromRules'])->name('charge-applicability.remove-charge');
        Route::post('applicable-charges', [ChargeRuleController::class, 'getApplicableCharges'])->name('charge-applicability.applicable-charges');
        Route::post('applicable-charge-ids', [ChargeRuleController::class, 'getApplicableChargeIds'])->name('charge-applicability.applicable-charge-ids');
        Route::post('validate-rules', [ChargeRuleController::class, 'validateRules'])->name('charge-applicability.validate-rules');
    });

    // Margin Engine (Margin Rules Management)
    Route::prefix('margin-engine')->group(function () {
        Route::get('', [MarginRuleController::class, 'index'])->name('margin-engine.index');

        // API endpoints for Margin Engine
        Route::post('get-rules', [MarginRuleController::class, 'getRulesForCombination'])->name('margin-engine.get-rules');
        Route::post('calculate-price', [MarginRuleController::class, 'calculateSalePrice'])->name('margin-engine.calculate-price');
        Route::post('add-rule', [MarginRuleController::class, 'addMarginRule'])->name('margin-engine.add-rule');
        Route::patch('{marginRule}', [MarginRuleController::class, 'updateMarginRule'])->name('margin-engine.update-rule');
        Route::post('remove-rule', [MarginRuleController::class, 'removeMarginRule'])->name('margin-engine.remove-rule');
        Route::get('list-rules', [MarginRuleController::class, 'listAllRules'])->name('margin-engine.list-rules');
        Route::post('validate-rules', [MarginRuleController::class, 'validateRules'])->name('margin-engine.validate-rules');
        Route::post('calculate-bulk', [MarginRuleController::class, 'calculateBulkPrices'])->name('margin-engine.calculate-bulk');
    });

    // Quotes routes
    Route::resource('quotes', QuoteController::class);

    // Quotation Module Routes (19-23)
    Route::resource('quotations', QuotationController::class);

    // Module 19: Quotation Creation
    // Already handled by resource routes: create, store

    // Module 20: Costing & Comparison
    Route::prefix('quotations/{quotation}')->group(function () {
        Route::post('prepare-for-costing', [QuotationController::class, 'prepareForCosting'])->name('quotations.prepare-for-costing');
        Route::get('costing', [QuotationController::class, 'costing'])->name('quotations.costing');
        Route::post('finalize-costs', [QuotationController::class, 'finalizeCosts'])->name('quotations.finalize-costs');

        // Module 21: Quotation Builder (Pricing)
        Route::get('pricing', [QuotationController::class, 'pricing'])->name('quotations.pricing');
        Route::post('finalize-pricing', [QuotationController::class, 'finalizePricing'])->name('quotations.finalize-pricing');

        // Module 22: Management
        Route::post('duplicate', [QuotationController::class, 'duplicate'])->name('quotations.duplicate');
        Route::post('update-status', [QuotationController::class, 'updateStatus'])->name('quotations.update-status');
    });

    // Cost Line API endpoints (Module 20)
    Route::patch('api/cost-lines/{costLine}/update-vendor', [QuotationController::class, 'updateCostLineVendor'])->name('cost-lines.update-vendor');

    // Sale Line API endpoints (Module 21)
    Route::patch('api/sale-lines/{saleLine}/update-price', [QuotationController::class, 'updateSalePrice'])->name('sale-lines.update-price');

    // Module 23: Quotation Approval Workflow
    Route::prefix('quotations-approval')->group(function () {
        Route::get('', [QuotationApprovalController::class, 'index'])->name('quotations.approval.index');
        Route::get('{quotation}', [QuotationApprovalController::class, 'show'])->name('quotations.approval.show');
        Route::post('{quotation}/approve', [QuotationApprovalController::class, 'approve'])->name('quotations.approval.approve');
        Route::post('{quotation}/reject', [QuotationApprovalController::class, 'reject'])->name('quotations.approval.reject');
    });

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

    // Formula Engine routes
    Route::prefix('formula-engine')->group(function () {
        Route::get('', [FormulaCalculatorController::class, 'index'])->name('formula-engine.index');
    });

    // Formula Engine API routes
    Route::prefix('formula')->group(function () {
        Route::post('calculate-cbm', [FormulaCalculatorController::class, 'calculateCBM'])->name('formula.calculate-cbm');
        Route::post('calculate-volumetric-weight', [FormulaCalculatorController::class, 'calculateVolumetricWeight'])->name('formula.calculate-volumetric-weight');
        Route::post('calculate-chargeable-weight', [FormulaCalculatorController::class, 'calculateChargeableWeight'])->name('formula.calculate-chargeable-weight');
        Route::post('calculate-all', [FormulaCalculatorController::class, 'calculateAll'])->name('formula.calculate-all');
    });

    // Tax Calculation Engine routes
    Route::prefix('tax-engine')->group(function () {
        Route::get('', [TaxCalculationEngineController::class, 'index'])->name('tax-engine.index');

        // API endpoints for Tax Engine
        Route::post('calculate', [TaxCalculationEngineController::class, 'calculate'])->name('tax-engine.calculate');
        Route::post('calculate-batch', [TaxCalculationEngineController::class, 'calculateBatch'])->name('tax-engine.calculate-batch');
    });
});

require __DIR__.'/settings.php';
