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
            ['cropName' => 'Eggplant', 'variety' => 'Calixto', 'type' => 'Vegetables', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Eggplant', 'variety' => 'Fortuner', 'type' => 'Vegetables', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Pechay', 'variety' => 'Pavito', 'type' => 'Vegetables', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Sitaw', 'variety' => 'Max Green', 'type' => 'Vegetables', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Squash', 'variety' => 'Suprema', 'type' => 'Vegetables', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Tomato', 'variety' => 'Diamante Max', 'type' => 'Vegetables', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Upo', 'variety' => 'Mayumi', 'type' => 'Vegetables', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Watermelon', 'variety' => 'Sugarbaby Max', 'type' => 'Fruit Trees', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Ampalaya', 'variety' => 'Galaxy', 'type' => 'Vegetables', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Lowland Kangkong', 'variety' => '', 'type' => 'Vegetables', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Red Hot Pepper', 'variety' => 'Superheat', 'type' => 'Vegetables', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Saluyot', 'variety' => 'Light Green', 'type' => 'Vegetables', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Upo', 'variety' => 'Tambuli', 'type' => 'Vegetables', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Watermelon', 'variety' => 'Phoenix', 'type' => 'Fruit Trees', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Watermelon', 'variety' => 'Sugarmommy', 'type' => 'Fruit Trees', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Patola', 'variety' => 'Primera Grande', 'type' => 'Vegetables', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Watermelon', 'variety' => 'Jaguar', 'type' => 'Fruit Trees', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Okra', 'variety' => 'Smooth Green', 'type' => 'Vegetables', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Sitao', 'variety' => 'Galante', 'type' => 'Vegetables', 'created_at' => $now, 'updated_at' => $now],
            ['cropName' => 'Upland Kangkong', 'variety' => '', 'type' => 'Vegetables', 'created_at' => $now, 'updated_at' => $now],
        ];

        DB::table('crops')->insert($crops);
    }
}
