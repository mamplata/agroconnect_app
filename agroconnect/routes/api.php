<?php

use Illuminate\Http\Request;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BarangayController;
use App\Http\Controllers\FarmerController;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// Api for users
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);
Route::post('/login', [UserController::class, 'login']);

// Api for barangays
Route::get('/barangays', [BarangayController::class, 'index']);
Route::post('/barangays', [BarangayController::class, 'store']);
Route::get('/barangays/{id}', [BarangayController::class, 'show']);
Route::put('/barangays/{id}', [BarangayController::class, 'update']);
Route::delete('/barangays/{id}', [BarangayController::class, 'destroy']);

// Api for farmers
Route::get('/farmers', [FarmerController::class, 'index']);
Route::post('/farmers', [FarmerController::class, 'store']);
Route::get('/farmers/{id}', [FarmerController::class, 'show']);
Route::put('/farmers/{id}', [FarmerController::class, 'update']);
Route::delete('/farmers/{id}', [FarmerController::class, 'destroy']);
