<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SeguimientoController extends Controller
{
    public function followers(Request $request, User $user)
    {
        $followers = $user->followers()->paginate(15);
        return response()->json($followers);
    }

    public function following(Request $request, User $user)
    {
        $following = $user->following()->paginate(15);
        return response()->json($following);
    }

    public function myFollowing(Request $request)
    {
        $user = $request->user();
        return response()->json($user->following()->paginate(15));
    }

    public function follow(Request $request, User $user)
    {
        $me = $request->user();

        if ($me->id === $user->id) {
            return response()->json(['message' => 'No puedes seguirte a ti mismo'], 400);
        }

        DB::table('seguimientos')->insertOrIgnore([
            'seguidor_id' => $me->id,
            'seguido_id' => $user->id,
            'fecha' => now(),
        ]);

        return response()->json(['message' => 'Usuario seguido'], 201);
    }

    public function unfollow(Request $request, User $user)
    {
        $me = $request->user();

        DB::table('seguimientos')
            ->where('seguidor_id', $me->id)
            ->where('seguido_id', $user->id)
            ->delete();

        return response()->json(['message' => 'Usuario dejado de seguir']);
    }
}
