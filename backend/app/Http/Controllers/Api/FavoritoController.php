<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorito;
use Illuminate\Http\Request;

class FavoritoController extends Controller
{
    // Listar favoritos del usuario autenticado
    public function index(Request $request)
    {
        $favoritos = $request->user()
            ->favoritos()
            ->with('producto')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($favoritos);
    }

    // Añadir favorito
    public function store(Request $request)
    {
        $request->validate([
            'producto_id' => 'required|exists:productos,id',
        ]);

        $yaExiste = Favorito::where('user_id', $request->user()->id)
            ->where('producto_id', $request->producto_id)
            ->exists();

        if ($yaExiste) {
            return response()->json([
                'message' => 'Este producto ya está en tus favoritos.',
            ], 409);
        }

        $favorito = Favorito::create([
            'user_id'     => $request->user()->id,
            'producto_id' => $request->producto_id,
        ]);

        return response()->json($favorito->load('producto'), 201);
    }

    // Eliminar favorito
    public function destroy(Request $request, int $productoId)
    {
        $eliminado = Favorito::where('user_id', $request->user()->id)
        ->where('producto_id', $productoId)
        ->delete();

        if (! $eliminado) {
            return response()->json([
                'message' => 'Este producto no está en tus favoritos.',
            ], 404);
        }

        return response()->json([
            'message' => 'Producto eliminado de favoritos.',
        ]);
    }
}