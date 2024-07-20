<?php

use Illuminate\Http\Request;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CropController;
use App\Http\Controllers\BarangayController;
use App\Http\Controllers\FarmerController;
use App\Http\Controllers\RecordController;
use App\Http\Controllers\ProductionController;
use App\Http\Controllers\PriceController;
use App\Http\Controllers\PestController;
use App\Http\Controllers\DiseaseController;
use App\Http\Controllers\SoilHealthController;
use App\Http\Controllers\ConcernController;
use App\Http\Controllers\WeatherForecastController;
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

// Api for crops
Route::get('/crops', [CropController::class, 'index']);
Route::post('/crops', [CropController::class, 'store']);
Route::get('/crops/{id}', [CropController::class, 'show']);
Route::put('/crops/{id}', [CropController::class, 'update']);
Route::delete('/crops/{id}', [CropController::class, 'destroy']);

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

// Api for records
Route::get('/records', [RecordController::class, 'index']);
Route::get('/records/{type}', [RecordController::class, 'indexByType']);
Route::post('/records', [RecordController::class, 'store']);
Route::get('/records/{id}', [RecordController::class, 'show']);
Route::put('/records/{id}', [RecordController::class, 'update']);
Route::delete('/records/{id}', [RecordController::class, 'destroy']);

// Api for productions
Route::get('/productions', [ProductionController::class, 'index']);
Route::post('/productions', [ProductionController::class, 'store']);
Route::get('/productions/{id}', [ProductionController::class, 'show']);
Route::put('/productions/{id}', [ProductionController::class, 'update']);
Route::post('/productions-batch', [ProductionController::class, 'storeBatch']);
Route::delete('/productionsByRecords', [ProductionController::class, 'destroyBatch']);

// Api for prices
Route::get('/prices', [PriceController::class, 'index']);
Route::post('/prices', [PriceController::class, 'store']);
Route::get('/prices/{id}', [PriceController::class, 'show']);
Route::put('/prices/{id}', [PriceController::class, 'update']);
Route::delete('/prices/{id}', [PriceController::class, 'destroy']);
Route::post('/prices-batch', [PriceController::class, 'storeBatch']);
Route::delete('/pricesByRecords', [PriceController::class, 'destroyBatch']);

// Api for pests
Route::get('/pests', [PestController::class, 'index']);
Route::post('/pests', [PestController::class, 'store']);
Route::get('/pests/{id}', [PestController::class, 'show']);
Route::put('/pests/{id}', [PestController::class, 'update']);
Route::delete('/pests/{id}', [PestController::class, 'destroy']);
Route::post('/pests-batch', [PestController::class, 'storeBatch']);
Route::delete('/pestsByRecords', [PestController::class, 'destroyBatch']);

// Api for diseases
Route::get('/diseases', [DiseaseController::class, 'index']);
Route::post('/diseases', [DiseaseController::class, 'store']);
Route::get('/diseases/{id}', [DiseaseController::class, 'show']);
Route::put('/diseases/{id}', [DiseaseController::class, 'update']);
Route::delete('/diseases/{id}', [DiseaseController::class, 'destroy']);
Route::post('/diseases-batch', [DiseaseController::class, 'storeBatch']);
Route::delete('/diseasesByRecords', [DiseaseController::class, 'destroyBatch']);

// Api for soilhealths
Route::get('/soilhealths', [SoilHealthController::class, 'index']);
Route::post('/soilhealths', [SoilHealthController::class, 'store']);
Route::get('/soilhealths/{id}', [SoilHealthController::class, 'show']);
Route::put('/soilhealths/{id}', [SoilHealthController::class, 'update']);
Route::delete('/soilhealths/{id}', [SoilHealthController::class, 'destroy']);
Route::post('/soilhealths-batch', [SoilHealthController::class, 'storeBatch']);
Route::delete('/soilhealthsByRecords', [SoilHealthController::class, 'destroyBatch']);

// Api for concerns
Route::get('/concerns', [ConcernController::class, 'index']);
Route::post('/concerns', [ConcernController::class, 'store']);
Route::get('/concerns/{id}', [ConcernController::class, 'show']);
Route::put('/concerns/{id}', [ConcernController::class, 'update']);
Route::delete('/concerns/{id}', [ConcernController::class, 'destroy']);

// Api for weatherforecasts
Route::get('/weatherforecasts', [WeatherForecastController::class, 'index']);
Route::post('/weatherforecasts', [WeatherForecastController::class, 'store']);
Route::get('/weatherforecasts/{id}', [WeatherForecastController::class, 'show']);
Route::put('/weatherforecasts/{id}', [WeatherForecastController::class, 'update']);
Route::delete('/weatherforecasts/{id}', [WeatherForecastController::class, 'destroy']);
