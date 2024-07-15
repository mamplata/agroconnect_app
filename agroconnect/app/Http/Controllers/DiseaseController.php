<?php

namespace App\Http\Controllers;

use App\Models\Disease;
use Illuminate\Http\Request;

class DiseaseController extends Controller
{
    public function index()
    {
        // Get all diseases, ordered by their ID in descending order
        $diseases = Disease::orderBy('id', 'desc')->get();

        return response()->json($diseases, 200);
    }

    public function store(Request $request)
    {
        // Validate incoming request data
        $request->validate([
            'recordId' => 'required|exists:records,recordId',
            'cropName' => 'required|string|max:255',
            'diseaseName' => 'required|string|max:255',
            'season' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'monthYear' => 'required|string|max:255',
        ]);

        // If validation passes, create a new disease record
        $disease = new Disease([
            'recordId' => $request->input('recordId'),
            'cropName' => $request->input('cropName'),
            'diseaseName' => $request->input('diseaseName'),
            'season' => $request->input('season'),
            'type' => $request->input('type'),
            'monthYear' => $request->input('monthYear'),
        ]);

        // Save the disease record to the database
        $disease->save();

        // Return a JSON response with the created disease data and status code 201 (Created)
        return response()->json($disease, 201);
    }

    public function show($id)
    {
        // Find a specific disease by its ID
        $disease = Disease::findOrFail($id);
        return response()->json($disease);
    }

    public function update(Request $request, $id)
    {
        // Validate incoming request data
        $request->validate([
            'recordId' => 'exists:records,recordId',
            'cropName' => 'string|max:255',
            'diseaseName' => 'string|max:255',
            'season' => 'string|max:255',
            'type' => 'string|max:255',
            'monthYear' => 'string|max:255',
        ]);

        // Find the specific disease record by its ID
        $disease = Disease::findOrFail($id);

        // Update the disease record with validated data
        $disease->update($request->all());

        // Return a JSON response with the updated disease data and status code 200 (OK)
        return response()->json($disease, 200);
    }

    public function destroy($id)
    {
        // Find the specific disease record by its ID
        $disease = Disease::findOrFail($id);

        // Delete the disease record from the database
        $disease->delete();

        // Return a JSON response with status code 204 (No Content)
        return response()->json(null, 204);
    }
}
