<?php

namespace App\Http\Controllers;

use App\Models\Production;
use Illuminate\Http\Request;

class ProductionController extends Controller
{
    public function index()
    {
        // Get all productions, ordered by their ID in descending order
        $productions = Production::orderBy('productionId', 'desc')->get();

        return response()->json($productions, 200);
    }

    public function store(Request $request)
    {
        // Validate incoming request data
        $request->validate([
            'recordId' => 'required|exists:records,recordId',
            'barangay' => 'required|string|max:255',
            'cropName' => 'required|string|max:255',
            'variety' => 'required|string|max:255',
            'areaPlanted' => 'required|numeric',
            'monthPlanted' => 'required|string|max:255',
            'monthHarvested' => 'required|string|max:255',
            'volumeProduction' => 'required|numeric',
            'productionCost' => 'required|numeric',
            'price' => 'required|string|max:255',
            'volumeSold' => 'required|numeric',
            'season' => 'required|string|max:255',
            'monthYear' => 'required|string|max:255',
        ]);

        // If validation passes, create a new production record
        $production = new Production([
            'recordId' => $request->input('recordId'),
            'barangay' => $request->input('barangay'),
            'cropName' => $request->input('cropName'),
            'variety' => $request->input('variety'),
            'areaPlanted' => $request->input('areaPlanted'),
            'monthPlanted' => $request->input('monthPlanted'),
            'monthHarvested' => $request->input('monthHarvested'),
            'volumeProduction' => $request->input('volumeProduction'),
            'productionCost' => $request->input('productionCost'),
            'price' => $request->input('price'),
            'volumeSold' => $request->input('volumeSold'),
            'season' => $request->input('season'),
            'monthYear' => $request->input('monthYear'),
        ]);

        // Save the production record to the database
        $production->save();

        // Return a JSON response with the created production data and status code 201 (Created)
        return response()->json($production, 201);
    }

    public function storeBatch(Request $request)
    {
        // Validate the incoming data
        $request->validate([
            '*.recordId' => 'required|integer',
            '*.barangay' => 'required|string',
            '*.cropName' => 'required|string',
            '*.variety' => 'nullable|string',
            '*.areaPlanted' => 'required|numeric',
            '*.monthPlanted' => 'required|string',
            '*.monthHarvested' => 'required|string',
            '*.volumeProduction' => 'required|numeric',
            '*.productionCost' => 'required|numeric',
            '*.volumeSold' => 'required|numeric',
            '*.price' => 'required|string',
            '*.season' => 'required|string',
            '*.monthYear' => 'required|string',
        ]);

        // Get all the productions from the request
        $productions = $request->json()->all();

        // Store or update each production record
        foreach ($productions as $productionData) {

            $production = new Production([
                'recordId' => $productionData['recordId'],
                'barangay' => $productionData['barangay'],
                'cropName' => $productionData['cropName'],
                'variety' => $productionData['variety'],
                'areaPlanted' => $productionData['areaPlanted'],
                'monthPlanted' => $productionData['monthPlanted'],
                'monthHarvested' => $productionData['monthHarvested'],
                'volumeProduction' => $productionData['volumeProduction'],
                'productionCost' => $productionData['productionCost'],
                'volumeSold' => $productionData['volumeSold'],
                'price' => $productionData['price'],
                'season' => $productionData['season'],
                'monthYear' => $productionData['monthYear']
            ]);

            $production->save();
        }

        return response()->json(['message' => 'Batch stored successfully'], 200);
    }

    public function destroy($id)
    {
        // Find the specific production record by its ID
        $production = Production::findOrFail($id);

        // Delete the production record from the database
        $production->delete();

        // Return a JSON response with status code 204 (No Content)
        return response()->json(null, 204);
    }
}
