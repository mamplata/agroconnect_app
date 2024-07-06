<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Redirect;

// Public Site web routes
Route::get('/', function () {
    return File::get(public_path('index.html'));
});

Route::get('management/admin', function () {
    return response()->file(public_path('management/login/index.html'));
});

Route::get('management/admin', function () {
    return response()->file(public_path('management/admin/index.html'));
});

Route::get('management/agriculturist', function () {
    return response()->file(public_path('management/agriculturist/index.html'));
});
