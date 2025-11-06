<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 150 orders with 2-5 items each
        Order::factory(150)->create()->each(function (Order $order) {
            $itemCount = random_int(2, 5);
            for ($i = 0; $i < $itemCount; $i++) {
                OrderItem::factory()->create(['order_id' => $order->id]);
            }
        });
    }
}
