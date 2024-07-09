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
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ],
            [
                'firstName' => 'Jane',
                'lastName' => 'Smith',
                'username' => 'admin2',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ],
            [
                'firstName' => 'Michael',
                'lastName' => 'Johnson',
                'username' => 'agriculturist1',
                'password' => Hash::make('password123'),
                'role' => 'agriculturist',
            ],
            [
                'firstName' => 'Emily',
                'lastName' => 'Brown',
                'username' => 'agriculturist2',
                'password' => Hash::make('password123'),
                'role' => 'agriculturist',
            ],
            [
                'firstName' => 'David',
                'lastName' => 'Martinez',
                'username' => 'agriculturist3',
                'password' => Hash::make('password123'),
                'role' => 'agriculturist',
            ],
            [
                'firstName' => 'Sarah',
                'lastName' => 'Garcia',
                'username' => 'agriculturist4',
                'password' => Hash::make('password123'),
                'role' => 'agriculturist',
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }
    }
}
