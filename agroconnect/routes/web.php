<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return file_get_contents(public_path('index.html'));
})->name('index');
