<?php

namespace App\Http\Controllers;

use App\Models\Pest;
use Illuminate\Http\Request;

class PestController extends Controller
{
    public function index()
    {
        // Get all pests, ordered by their ID in descending order
        $pests = Pest::orderBy('id', 'desc')->get();

        return response()->json($pests, 200);
    }

    public function store(Request $request)
    {
        // Validate incoming request data
        $request->validate([
            'recordId' => 'required|exists:records,recordId',
            'cropName' => 'required|string|max:255',
            'pestName' => 'required|string|max:255',
            'season' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'monthYear' => 'required|string|max:255',
        ]);

        // If validation passes, create a new pest record
        $pest = new Pest([
            'recordId' => $request->input('recordId'),
            'cropName' => $request->input('cropName'),
            'pestName' => $request->input('pestName'),
            'season' => $request->input('season'),
            'type' => $request->input('type'),
            'monthYear' => $request->input('monthYear'),
        ]);

        // Save the pest record to the database
        $pest->save();

        // Return a JSON response with the created pest data and status code 201 (Created)
        return response()->json($pest, 201);
    }

    public function show($id)
    {
        // Find a specific pest by its ID
        $pest = Pest::findOrFail($id);
        return response()->json($pest);
    }

    public function update(Request $request, $id)
    {
        // Validate incoming request data
        $request->validate([
            'recordId' => 'exists:records,recordId',
            'cropName' => 'string|max:255',
            'pestName' => 'string|max:255',
            'season' => 'string|max:255',
            'type' => 'string|max:255',
            'monthYear' => 'string|max:255',
        ]);

        // Find the specific pest record by its ID
        $pest = Pest::findOrFail($id);

        // Update the pest record with validated data
        $pest->update($request->all());

        // Return a JSON response with the updated pest data and status code 200 (OK)
        return response()->json($pest, 200);
    }

    public function destroy($id)
    {
        // Find the specific pest record by its ID
        $pest = Pest::findOrFail($id);

        // Delete the pest record from the database
        $pest->delete();

        // Return a JSON response with status code 204 (No Content)
        return response()->json(null, 204);
    }
}
