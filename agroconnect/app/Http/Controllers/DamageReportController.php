<?php

namespace App\Http\Controllers;

use App\Models\DamageReport;
use Illuminate\Http\Request;

class DamageReportController extends Controller
{
    public function index()
    {
        // Get all damage reports, ordered by their ID in descending order
        $damageReports = DamageReport::orderBy('damageId', 'desc')->get();

        return response()->json($damageReports, 200);
    }

    public function store(Request $request)
    {
        // Validate incoming request data
        $request->validate([
            'barangay' => 'required|string|max:255',
            'cropName' => 'required|string|max:255',
            'variety' => 'required|string|max:255',
            'numberOfFarmers' => 'required|integer',
            'areaAffected' => 'required|numeric',
            'yieldLoss' => 'required|numeric',
            'grandTotalValue' => 'required|numeric',
        ]);

        // If validation passes, create a new damage report record
        $damageReport = new DamageReport([
            'barangay' => $request->input('barangay'),
            'cropName' => $request->input('cropName'),
            'variety' => $request->input('variety'),
            'numberOfFarmers' => $request->input('numberOfFarmers'),
            'areaAffected' => $request->input('areaAffected'),
            'yieldLoss' => $request->input('yieldLoss'),
            'grandTotalValue' => $request->input('grandTotalValue'),
        ]);

        // Save the damage report record to the database
        $damageReport->save();

        // Return a JSON response with the created damage report data and status code 201 (Created)
        return response()->json($damageReport, 201);
    }

    public function storeBatch(Request $request)
    {
        $damageDataArray = $request->input('damageData');

        // Process and store each item in the validated data
        foreach ($damageDataArray as $damageData) {
            $request->validate([
                'damageData.*.barangay' => 'required|string|max:255',
                'damageData.*.cropName' => 'required|string|max:255',
                'damageData.*.variety' => 'required|string|max:255',
                'damageData.*.numberOfFarmers' => 'required|integer',
                'damageData.*.areaAffected' => 'required|numeric',
                'damageData.*.yieldLoss' => 'required|numeric',
                'damageData.*.grandTotalValue' => 'required|numeric',
            ]);

            DamageReport::updateOrCreate(
                [
                    'barangay' => $damageData['barangay'],
                    'cropName' => $damageData['cropName'],
                    'variety' => $damageData['variety'],
                    'numberOfFarmers' => $damageData['numberOfFarmers'],
                    'areaAffected' => $damageData['areaAffected'],
                    'yieldLoss' => $damageData['yieldLoss'],
                    'grandTotalValue' => $damageData['grandTotalValue']
                ]
            );
        }

        return response()->json(['message' => 'Batch data stored successfully']);
    }

    public function destroy($id)
    {
        // Find the specific damage report record by its ID
        $damageReport = DamageReport::findOrFail($id);

        // Delete the damage report record from the database
        $damageReport->delete();

        // Return a JSON response with status code 204 (No Content)
        return response()->json(null, 204);
    }

    public function destroyBatch(Request $request)
    {
        // Retrieve the array of records from the request
        $damageDataArray = $request->input('damageData');

        // Check if the input is an array and not empty
        if (!is_array($damageDataArray) || empty($damageDataArray)) {
            return response()->json(['error' => 'Invalid input'], 400);
        }

        // Extract foreign keys (damageIds) from the damage data array
        $foreignKeys = array_column($damageDataArray, 'damageId');

        // Validate that foreign keys are properly extracted
        if (empty($foreignKeys)) {
            return response()->json(['error' => 'No valid foreign keys found'], 400);
        }

        // Find the primary keys of records in the DamageReport table that match the foreign keys
        $recordsToDelete = DamageReport::whereIn('damageId', $foreignKeys)->pluck('damageId');

        // Ensure that we have valid records to delete
        if ($recordsToDelete->isEmpty()) {
            return response()->json(['error' => 'No records found to delete'], 404);
        }

        // Delete the records from the database
        DamageReport::whereIn('damageId', $recordsToDelete)->delete();

        // Return a JSON response with status code 204 (No Content)
        return response()->json(null, 204);
    }
}
