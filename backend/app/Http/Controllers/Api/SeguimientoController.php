<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SeguimientoController extends Controller
{
    /**
     * GET /api/users/public
     * Devuelve usuarios con perfil público, con búsqueda opcional por nombre o username.
     * Parámetros: q (string, opcional), page (int, opcional).
     */
    public function publicProfiles(Request $request)
    {
        $q = $request->query('q', '');

        $query = User::where('visibilidad', true)
            ->select('id', 'nombre', 'username', 'foto', 'rol');

        if ($q !== '') {
            $like = '%' . $q . '%';
            $query->where(function ($builder) use ($like) {
                $builder->where('nombre', 'like', $like)
                        ->orWhere('username', 'like', $like);
            });
        }

        $results = $query->orderBy('nombre')->paginate(16);

        return response()->json($results);
    }

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
        // Devuelve solo los IDs (para el set de "ya sigo")
        $user = $request->user();
        $ids = $user->following()->pluck('users.id');
        return response()->json($ids);
    }

    /**
     * GET /api/me/following/list
     * Devuelve la lista completa de usuarios que sigue el usuario autenticado (con datos).
     */
    public function myFollowingList(Request $request)
    {
        $user = $request->user();
        $list = $user->following()
            ->select('users.id', 'users.nombre', 'users.username', 'users.foto', 'users.rol')
            ->orderBy('users.nombre')
            ->get();
        return response()->json($list);
    }

    /**
     * GET /api/me/followers
     * Devuelve la lista de usuarios que siguen al usuario autenticado.
     */
    public function myFollowers(Request $request)
    {
        $user = $request->user();
        $list = $user->followers()
            ->select('users.id', 'users.nombre', 'users.username', 'users.foto', 'users.rol')
            ->orderBy('users.nombre')
            ->get();
        return response()->json($list);
    }

    /**
     * GET /api/users/{user}/profile
     * Devuelve el perfil público de un usuario por su ID.
     */
    public function publicProfile(Request $request, User $user)
    {
        if (!$user->visibilidad) {
            return response()->json(['message' => 'Este perfil no es público'], 404);
        }

        // Listas públicas con conteo de productos
        $listasPublicas = $user->listas()
            ->where('publica', true)
            ->withCount('productos')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'nombre_lista', 'descripcion', 'publica', 'created_at'])
            ->map(fn($l) => [
                'id'             => $l->id,
                'nombre'         => $l->nombre_lista,
                'descripcion'    => $l->descripcion,
                'productos_count'=> $l->productos_count,
            ]);

        // Periféricos principales del inventario (uno por tipo)
        $inventarioPrincipal = $user->inventario()
            ->where('principal', true)
            ->with('producto:id,marca,modelo,tipo,foto')
            ->get();

        return response()->json([
            'id'                   => $user->id,
            'nombre'               => $user->nombre,
            'username'             => $user->username,
            'foto'                 => $user->foto,
            'rol'                  => $user->rol,
            'created_at'           => $user->created_at,
            'followers_count'      => $user->followers()->count(),
            'following_count'      => $user->following()->count(),
            'listas_publicas'      => $listasPublicas,
            'inventario_principal' => $inventarioPrincipal->map(fn($item) => [
                'producto_id' => $item->producto_id,
                'cantidad'    => $item->cantidad,
                'producto'    => $item->producto,
            ]),
        ]);
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
            'created_at' => now(),
            'updated_at' => now(),
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
