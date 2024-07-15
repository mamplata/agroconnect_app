<?php

namespace App\Http\Controllers;

use App\Models\Price;
use Illuminate\Http\Request;

class PriceController extends Controller
{
    public function index()
    {
        // Get all prices, ordered by their ID in descending order
        $prices = Price::orderBy('priceId', 'desc')->get();

        return response()->json($prices, 200);
    }

    public function store(Request $request)
    {
        // Validate incoming request data
        $request->validate([
            'recordId' => 'required|exists:records,recordId',
            'cropName' => 'required|string|max:255',
            'price' => 'required|numeric',
            'season' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'monthYear' => 'required|string|max:255',
        ]);

        // If validation passes, create a new price record
        $price = new Price([
            'recordId' => $request->input('recordId'),
            'cropName' => $request->input('cropName'),
            'price' => $request->input('price'),
            'season' => $request->input('season'),
            'type' => $request->input('type'),
            'monthYear' => $request->input('monthYear'),
        ]);

        // Save the price record to the database
        $price->save();

        // Return a JSON response with the created price data and status code 201 (Created)
        return response()->json($price, 201);
    }

    public function show($id)
    {
        // Find a specific price by its ID
        $price = Price::findOrFail($id);
        return response()->json($price);
    }

    public function update(Request $request, $id)
    {
        // Validate incoming request data
        $request->validate([
            'recordId' => 'exists:records,recordId',
            'cropName' => 'string|max:255',
            'price' => 'numeric',
            'season' => 'string|max:255',
            'type' => 'string|max:255',
            'monthYear' => 'string|max:255',
        ]);

        // Find the specific price record by its ID
        $price = Price::findOrFail($id);

        // Update the price record with validated data
        $price->update($request->all());

        // Return a JSON response with the updated price data and status code 200 (OK)
        return response()->json($price, 200);
    }

    public function destroy($id)
    {
        // Find the specific price record by its ID
        $price = Price::findOrFail($id);

        // Delete the price record from the database
        $price->delete();

        // Return a JSON response with status code 204 (No Content)
        return response()->json(null, 204);
    }
}
