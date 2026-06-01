<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consulta;
use App\Models\Producto;
use App\Models\Resenia;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function stats()
    {
        return response()->json([
            'total_usuarios' => User::count(),
            'total_admins_mods' => User::whereIn('rol', ['ADMIN', 'MOD'])->count(),
            'total_productos' => Producto::count(),
            'total_resenias' => Resenia::count(),
            'total_resenias_visibles' => Resenia::where('visible', true)->count(),
            'total_resenias_ocultas' => Resenia::where('visible', false)->count(),
            'total_consultas' => Consulta::count(),
            'consultas_abiertas' => Consulta::where('estado', 'ABIERTA')->count(),
            'consultas_cerradas' => Consulta::where('estado', 'CERRADA')->count(),
        ]);
    }

    public function usuarios(Request $request)
    {
        $usuarios = User::select('id', 'nombre', 'email', 'rol', 'visibilidad', 'created_at')
            ->withCount('resenias')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($usuarios);
    }

    public function productos(Request $request)
    {
        $productos = Producto::withCount('resenias')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($productos);
    }

    public function resenias(Request $request)
    {
        $resenias = Resenia::with(['user:id,nombre', 'producto:id,marca,modelo'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($resenias);
    }

    public function destroyUser(User $user)
    {
        $user->delete();

        return response()->json([
            'message' => 'Usuario eliminado correctamente.',
        ]);
    }

    public function toggleUserVisibility(Request $request, User $user)
    {
        $request->validate([
            'visibilidad' => 'required|boolean',
        ]);

        $user->update(['visibilidad' => $request->visibilidad]);

        return response()->json($user);
    }
}
