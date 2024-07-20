<?php

namespace App\Http\Controllers;

use App\Models\Record;
use App\Models\Production;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class RecordController extends Controller
{
    public function index()
    {
        // Get all record, with admins first, ordered by their ID in descending order
        $records = record::orderBy('recordId', 'desc')->get();

        return response()->json($records, 200);
    }

    public function store(Request $request)
    {
        // Validate the incoming request data
        $request->validate([
            'userId' => 'required|exists:users,userId',
            'name' => 'required|string|max:255',
            'season' => 'required|string|max:255',
            'monthYear' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'fileRecord' => 'required|string',
        ]);


        // Accessing input data using $request->input('fieldName')
        $record = new Record([
            'userId' => $request->input('userId'),
            'name' => $request->input('name'),
            'season' => $request->input('season'),
            'monthYear' => $request->input('monthYear'),
            'type' => $request->input('type'),
            'fileRecord' => $request->input('fileRecord'),
        ]);

        $record->save();

        return response()->json($record, 201);
    }

    public function show($id)
    {
        $record = Record::findOrFail($id);
        return response()->json($record);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'userId' => 'exists:users,userId',
            'name' => 'string|max:255',
            'season' => 'string|max:255',
            'monthYear' => 'string|max:255',
            'type' => 'string|max:255',
            'fileRecord' => 'nullable|string', // Allow fileRecord to be nullable and string
        ]);

        $record = Record::findOrFail($id);

        // Update record attributes except for 'fileRecord'
        $record->fill($request->except('fileRecord'));

        // Check if 'fileRecord' has a value and update it
        if ($request->has('fileRecord') && !empty($request->fileRecord)) {
            $record->fileRecord = $request->fileRecord;
        }

        // Save updated record to the database
        $record->save();

        // Return JSON response with the updated record and status code 200 (OK)
        return response()->json($record, 200);
    }

    public function destroy($id)
    {
        // Start a database transaction to ensure atomicity
        DB::beginTransaction();

        try {
            // Find and delete the record from the Record table
            $record = Record::findOrFail($id);
            // Delete associated records from the Production table
            // Assuming 'record_id' is the foreign key in the Production table
            Production::where('recordId', $id)->delete();

            $record->delete();

            // Commit the transaction
            DB::commit();

            return response()->json(null, 204);
        } catch (\Exception $e) {
            // Rollback the transaction if something goes wrong
            DB::rollBack();

            // Return a JSON response with status code 500 (Internal Server Error)
            return response()->json(['error' => 'Failed to delete record'], 500);
        }
    }
}
