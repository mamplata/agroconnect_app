<?php

namespace App\Http\Controllers;

use App\Models\WeatherForecast;
use Illuminate\Http\Request;

class WeatherForecastController extends Controller
{
    public function index()
    {
        // Get all weather forecasts, ordered by their ID in descending order
        $forecasts = WeatherForecast::orderBy('weatherforecastId', 'desc')->get();

        return response()->json($forecasts, 200);
    }

    public function store(Request $request)
    {
        // Validate incoming request data
        $request->validate([
            'weatherData' => 'required|array',
            'weatherData.*.date' => 'required|date',
            'weatherData.*.temperature' => 'required|numeric',
            'weatherData.*.humidity' => 'required|numeric',
            'weatherData.*.description' => 'required|string|max:255',
        ]);

        // If validation passes, create a new weather forecast record
        $forecast = new WeatherForecast([
            'weatherData' => $request->input('weatherData'),
        ]);

        // Save the weather forecast record to the database
        $forecast->save();

        // Return a JSON response with the created weather forecast data and status code 201 (Created)
        return response()->json($forecast, 201);
    }

    public function show($id)
    {
        // Find a specific weather forecast by its ID
        $forecast = WeatherForecast::findOrFail($id);
        return response()->json($forecast);
    }

    public function update(Request $request, $id)
    {
        // Validate incoming request data
        $request->validate([
            'weatherData' => 'array',
            'weatherData.*.date' => 'date',
            'weatherData.*.temperature' => 'numeric',
            'weatherData.*.humidity' => 'numeric',
            'weatherData.*.description' => 'string|max:255',
        ]);

        // Find the specific weather forecast record by its ID
        $forecast = WeatherForecast::findOrFail($id);

        // Update the weather forecast record with validated data
        $forecast->update([
            'weatherData' => $request->input('weatherData'),
        ]);

        // Return a JSON response with the updated weather forecast data and status code 200 (OK)
        return response()->json($forecast, 200);
    }

    public function destroy($id)
    {
        // Find the specific weather forecast record by its ID
        $forecast = WeatherForecast::findOrFail($id);

        // Delete the weather forecast record from the database
        $forecast->delete();

        // Return a JSON response with status code 204 (No Content)
        return response()->json(null, 204);
    }
}
