<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{

    public function index()
    {
        // Get all users, with admins first, ordered by their ID in descending order
        $users = User::orderByRaw("CASE WHEN role = 'admin' THEN 0 ELSE 1 END")->orderBy('userId', 'desc')->get();

        return response()->json($users, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'firstName' => 'required|string',
            'lastName' => 'required|string',
            'username' => 'required|unique:users,username',
            'password' => 'required|min:8',
            'role' => 'required',
        ]);

        // Accessing input data using $request->input('fieldName')
        $user = new User([
            'firstName' => $request->input('firstName'),
            'lastName' => $request->input('lastName'),
            'username' => $request->input('username'),
            'password' => Hash::make($request->input('password')),
            'role' => $request->input('role'),
        ]);

        $user->save();

        return response()->json($user, 201);
    }

    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user, 200);
    }

    public function update(Request $request, $id)
    {
        // Find user by ID
        $user = User::findOrFail($id);

        // Validate request data
        $request->validate([
            'firstName' => 'string',
            'lastName' => 'string',
            'role' => 'in:agriculturist',
            'password' => 'nullable|string|min:4', // Ensure minimum length for password if required
        ]);

        // Update user attributes
        $user->fill($request->only(['firstName', 'lastName', 'username', 'role']));

        // Check if password is provided and update if it has a value
        if ($request->has('password') && !empty($request->password)) {
            $user->password = Hash::make($request->password); // Hash the password
        }

        // Save updated user to the database
        $user->save();

        // Return JSON response with the updated user and status code 200 (OK)
        return response()->json($user, 200);
    }

    public function destroy($id)
    {
        $user = User::find($id);
        if ($user) {
            $user->delete();
            return response()->json(null, 204);
        } else {
            return response()->json(['message' => 'User not found'], 404);
        }
    }


    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            return response()->json([
                'user' => $user,
                'message' => 'Login successful!'
            ], 200);
        } else {
            return response()->json(['message' => 'Invalid credentials!'], 401);
        }
    }

    public function logout()
    {
        Auth::logout();
        return response()->json(['message' => 'Logout successful'], 200);
    }

    public function adminChangePassword(Request $request, User $user)
    {
        // Validate the request
        $request->validate([
            'new_password' => 'required|min:8',
        ]);

        // Update the user's password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password change successfully'], 200);
    }
}
