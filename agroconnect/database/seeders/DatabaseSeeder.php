<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        // Creating 10 users for demonstration purposes
        $users = [
            [
                'firstName' => 'John',
                'lastName' => 'Doe',
                'username' => 'admin1',
                'role' => 'admin',
                'password' => Hash::make('password123'),
            ],
            [
                'firstName' => 'Michael',
                'lastName' => 'Johnson',
                'username' => 'agriculturist1',
                'role' => 'agriculturist',
                'password' => Hash::make('password123'),
            ],
            [
                'firstName' => 'Emily',
                'lastName' => 'Brown',
                'username' => 'agriculturist2',
                'role' => 'agriculturist',
                'password' => Hash::make('password123'),
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }
    }
}
