<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class EmailVerificationController extends Controller
{
    public function verify(Request $request)
    {
        $user = User::findOrFail($request->id);

        if (! hash_equals((string) $request->hash, sha1($user->email))) {
            return response()->json([
                'message' => 'Invalid verification link.',
            ], 400);
        }

        if ($user->email_verified_at !== null) {
            return response()->json([
                'message' => 'Email already verified.',
            ], 400);
        }

        $user->markEmailAsVerified();

        return response()->json([
            'message' => 'Email verified successfully.',
            'user' => $user,
        ]);
    }

    public function resend(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users',
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user->email_verified_at !== null) {
            return response()->json([
                'message' => 'Email already verified.',
            ], 400);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Verification email sent. Please check your inbox.',
        ]);
    }
}
