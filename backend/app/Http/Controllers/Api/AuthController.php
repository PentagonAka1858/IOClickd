<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

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

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'nombre' => 'required|string|max:255',
            'username' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('users')->ignore($user->id),
            ],
            'email' => [
                'required',
                'email',
                Rule::unique('users')->ignore($user->id),
            ],
            'idioma_preferido' => 'sometimes|string|max:15',
            'visibilidad' => 'sometimes|boolean',
            'foto' => 'sometimes|image|max:2048',
        ]);

        $data = $request->only(['nombre', 'username', 'email', 'idioma_preferido']);

        if ($request->has('visibilidad')) {
            $data['visibilidad'] = (bool) $request->input('visibilidad');
        }

        $emailChanged = isset($data['email']) && $data['email'] !== $user->email;

        if ($request->hasFile('foto')) {
            // delete old foto if exists
            if ($user->foto) {
                Storage::disk('public')->delete($user->foto);
            }
            $path = $request->file('foto')->store('avatars', 'public');
            $data['foto'] = $path;
        }

        $user->fill($data);

        if ($emailChanged) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($emailChanged) {
            // try to send verification email if mail is configured
            try {
                $user->sendEmailVerificationNotification();
            } catch (\Throwable $e) {
                // ignore mail send errors, still return success and indicate verification needed
            }
        }

        return response()->json(["user" => $user, "email_verification_sent" => $emailChanged]);
    }
}