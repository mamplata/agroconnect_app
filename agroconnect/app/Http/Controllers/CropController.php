<?php

namespace App\Http\Controllers;

use App\Models\Crop;
use Illuminate\Http\Request;

class CropController extends Controller
{

    public function index()
    {
        // Get all crops, with admins first, ordered by their ID in descending order
        $crops = Crop::orderBy('cropId', 'desc')->get();

        return response()->json($crops, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'cropName' => 'required|string',
            'priceWeight' => 'required|string',
            'type' => 'required|string',
            'priceValue' => 'required|string',
        ]);

        // Accessing input data using $request->input('fieldName')
        $crop = new Crop([
            'cropName' => $request->input('cropName'),
            'priceWeight' => $request->input('priceWeight'),
            'type' => $request->input('type'),
        ]);

        $crop->save();

        return response()->json($crop, 201);
    }

    public function show($id)
    {
        $crop = crop::findOrFail($id);
        return response()->json($crop, 200);
    }

    public function update(Request $request, $id)
    {
        // Find crop by username
        $crop = crop::findOrFail($id);

        // Validate request data
        $request->validate([
            'cropName' => 'required|string',
            'priceWeight' => 'required|string',
            'type' => 'required|string',
        ]);

        // Update crop attributes
        $crop->fill($request->only(['cropName', 'priceWeight', 'type']));

        // Save updated crop to the database
        $crop->save();

        // Return JSON response with the updated crop and status code 200 (OK)
        return response()->json($crop, 200);
    }

    public function destroy($id)
    {
        $crop = crop::find($id);
        if ($crop) {
            $crop->delete();
            return response()->json(null, 204);
        } else {
            return response()->json(['message' => 'crop not found'], 404);
        }
    }
}
