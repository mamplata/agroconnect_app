<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WeatherForecast extends Model
{
    use HasFactory;

    protected $primaryKey = 'weatherforecastId'; // Specify the primary key field name
    protected $fillable = [
        'weatherData',
    ];

    // The 'weatherData' column is of type JSON, so no relationships are defined here
}
