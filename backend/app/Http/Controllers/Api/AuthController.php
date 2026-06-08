<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
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

        // Send email verification notification
        $user->sendEmailVerificationNotification();

        Auth::login($user);

        return response()->json([
            'user'    => $user,
            'message' => 'Registration successful. Please verify your email to unlock full access.',
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

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'nombre'           => 'required|string|max:255',
            'idioma_preferido' => 'sometimes|string|max:15',
            'foto'             => 'nullable|image|max:2048', // 2MB max
        ]);

        $data = $request->only(['nombre', 'idioma_preferido']);

        if ($request->hasFile('foto')) {
            // Eliminar foto antigua si existe
            if ($user->foto && Storage::disk('public')->exists($user->foto)) {
                Storage::disk('public')->delete($user->foto);
            }
            // Guardar nueva foto
            $path = $request->file('foto')->store('photos/users', 'public');
            $data['foto'] = $path;
        }

        $user->update($data);

        return response()->json($user);
    }
}