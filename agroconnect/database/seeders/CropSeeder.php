<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CropSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $now = Carbon::now();
        $crops = [
            // Fruits
            ['cropName' => 'Coffee', 'type' => 'Fruits', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Banana', 'type' => 'Fruits', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Mango', 'type' => 'Fruits', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Dalanghita', 'type' => 'Fruits', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Calamansi', 'type' => 'Fruits', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Lanzones', 'type' => 'Fruits', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Mangosteen', 'type' => 'Fruits', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Jackfruit', 'type' => 'Fruits', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Rambutan', 'type' => 'Fruits', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Papaya', 'type' => 'Fruits', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Chico', 'type' => 'Fruits', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Guyabano', 'type' => 'Fruits', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Melon', 'type' => 'Fruits', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Pineapple', 'type' => 'Fruits', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Pomelo', 'type' => 'Fruits', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Watermelon', 'type' => 'Fruits', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Santol', 'type' => 'Fruits', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Dragon Fruit', 'type' => 'Fruits', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],

            // Vegetables
            ['cropName' => 'Ampalaya', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Eggplant', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Okra', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Squash', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'String beans', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Tomato', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Patola', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Upo', 'type' => 'Vegetables', 'priceWeight' => 'pc/(about 1kg)', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Lettuce', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Bell Pepper', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Snapbeans', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Pechay', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Mustard', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Pak Choi', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Spinach', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Kangkong (upland)', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Kangkong (water)', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Saluyot', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Purple Yam', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Cassava', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Sweet Potato', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Gabi', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Hot Pepper/Siling Labuyo', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Thai Chili', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Siling Panigang', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Black Pepper', 'type' => 'Vegetables', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Rice', 'type' => 'Rice', 'priceWeight' => 'kg', 'created_at' => $now, 'updated_at' => $now],
        ];

        DB::table('crops')->insert($crops);
    }
}
