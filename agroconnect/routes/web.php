<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return File::get(public_path('index.html'));
});

Route::get('/management', function () {
    return File::get(public_path('management/index.html'));
});

Route::get('/management/login', function () {
    return File::get(public_path('management/login.html'));
});
