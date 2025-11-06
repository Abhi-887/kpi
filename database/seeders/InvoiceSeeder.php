<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InvoiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Invoice::factory(150)->create()->each(function ($invoice) {
            // Create 2-5 items per invoice
            \App\Models\InvoiceItem::factory(fake()->numberBetween(2, 5))->create([
                'invoice_id' => $invoice->id,
            ]);

            // Update invoice totals based on items
            $items = $invoice->items()->get();
            $subtotal = $items->sum('line_total');
            $taxAmount = $items->sum('tax_amount');
            $totalAmount = $subtotal + $taxAmount - ($invoice->discount_amount ?? 0) + ($invoice->shipping_cost ?? 0);

            $invoice->update([
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
            ]);
        });
    }
}
