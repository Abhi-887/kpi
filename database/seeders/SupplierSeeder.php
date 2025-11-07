<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            ['supplier_id' => 'SUP-001', 'name' => 'ABC Packaging Co.', 'contact_person' => 'Rajesh Kumar', 'email' => 'rajesh@abcpkg.com', 'phone' => '9876543210', 'company' => 'ABC Packaging', 'gst_vat_number' => '27ABCPK1234A1Z5', 'address' => '123 Industrial Road', 'city' => 'Mumbai', 'state' => 'Maharashtra', 'country' => 'India', 'zip_code' => '400001', 'payment_terms' => 'Net 30', 'lead_time_days' => 5, 'preferred_currency' => 'INR', 'rating_score' => 4.5],
            ['supplier_id' => 'SUP-002', 'name' => 'XYZ Materials Ltd', 'contact_person' => 'Priya Singh', 'email' => 'priya@xyzmaterials.com', 'phone' => '9123456789', 'company' => 'XYZ Materials', 'gst_vat_number' => '29XYZMAT5678B2Y7', 'address' => '456 Trade Park', 'city' => 'Delhi', 'state' => 'Delhi', 'country' => 'India', 'zip_code' => '110001', 'payment_terms' => 'Net 45', 'lead_time_days' => 7, 'preferred_currency' => 'INR', 'rating_score' => 4.0],
            ['supplier_id' => 'SUP-003', 'name' => 'Global Logistics Hub', 'contact_person' => 'Ahmed Khan', 'email' => 'ahmed@globallog.com', 'phone' => '9988776655', 'company' => 'Global Logistics', 'gst_vat_number' => '36GLOBL9012C3Z8', 'address' => '789 Export Zone', 'city' => 'Bangalore', 'state' => 'Karnataka', 'country' => 'India', 'zip_code' => '560001', 'payment_terms' => 'Net 60', 'lead_time_days' => 10, 'preferred_currency' => 'INR', 'rating_score' => 3.8],
            ['supplier_id' => 'SUP-004', 'name' => 'QuickPack Solutions', 'contact_person' => 'Deepak Patel', 'email' => 'deepak@quickpack.com', 'phone' => '9765432109', 'company' => 'QuickPack', 'gst_vat_number' => '24QUICK3456D4W9', 'address' => '321 Industrial Estate', 'city' => 'Pune', 'state' => 'Maharashtra', 'country' => 'India', 'zip_code' => '411001', 'payment_terms' => 'Net 30', 'lead_time_days' => 3, 'preferred_currency' => 'INR', 'rating_score' => 4.7],
            ['supplier_id' => 'SUP-005', 'name' => 'Premium Supplies Inc', 'contact_person' => 'Anjali Sharma', 'email' => 'anjali@premiumpkg.com', 'phone' => '9654321098', 'company' => 'Premium Supplies', 'gst_vat_number' => '20PREMIT7890E5X1', 'address' => '654 Business Plaza', 'city' => 'Chennai', 'state' => 'Tamil Nadu', 'country' => 'India', 'zip_code' => '600001', 'payment_terms' => 'Net 15', 'lead_time_days' => 8, 'preferred_currency' => 'INR', 'rating_score' => 4.2],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::create($supplier);
        }
    }
}
