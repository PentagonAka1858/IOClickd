<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        echo "Register endpoint hit with data: " . json_encode($request->all());
        $request->validate([
            'nombre'           => 'required|string|max:255',
            'email'            => 'required|email|unique:users',
            'password'         => 'required|string|min:8|confirmed',
            'idioma_preferido' => 'sometimes|string|max:15',
        ]);

        $user = User::create([
            'nombre'           => $request->nombre,
            'email'            => $request->email,
            'password'         => $request->password, // el cast 'hashed' lo encripta solo
            'idioma_preferido' => $request->idioma_preferido ?? 'es',
        ]);

        Auth::login($user);

        return response()->json([
            'user'  => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no son correctas.'],
            ]);
        }

        Auth::login($user);

        return response()->json([
            'user'  => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}