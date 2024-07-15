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
            'productionCost' => 'required|numeric',
            'volumeSold' => 'required|numeric',
            'season' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'monthYear' => 'required|string|max:255',
        ]);

        // If validation passes, create a new production record
        $production = new Production([
            'recordId' => $request->input('recordId'),
            'barangay' => $request->input('barangay'),
            'cropName' => $request->input('cropName'),
            'variety' => $request->input('variety'),
            'areaPlanted' => $request->input('areaPlanted'),
            'productionCost' => $request->input('productionCost'),
            'volumeSold' => $request->input('volumeSold'),
            'season' => $request->input('season'),
            'type' => $request->input('type'),
            'monthYear' => $request->input('monthYear'),
        ]);

        // Save the production record to the database
        $production->save();

        // Return a JSON response with the created production data and status code 201 (Created)
        return response()->json($production, 201);
    }

    public function show($id)
    {
        // Find a specific production by its ID
        $production = Production::findOrFail($id);
        return response()->json($production);
    }

    public function update(Request $request, $id)
    {
        // Validate incoming request data
        $request->validate([
            'recordId' => 'exists:records,recordId',
            'barangay' => 'string|max:255',
            'cropName' => 'string|max:255',
            'variety' => 'string|max:255',
            'areaPlanted' => 'nullable|numeric',
            'productionCost' => 'nullable|numeric',
            'volumeSold' => 'nullable|numeric',
            'season' => 'string|max:255',
            'type' => 'string|max:255',
            'monthYear' => 'string|max:255',
        ]);

        // Find the specific production record by its ID
        $production = Production::findOrFail($id);

        // Update the production record with validated data
        $production->update($request->all());

        // Return a JSON response with the updated production data and status code 200 (OK)
        return response()->json($production, 200);
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
