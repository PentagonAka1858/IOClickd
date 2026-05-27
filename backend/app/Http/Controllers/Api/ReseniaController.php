<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resenia;
use Illuminate\Http\Request;

class ReseniaController extends Controller
{
    // Listar reseñas de un producto (público)
    public function index(int $productoId)
    {
        $resenias = Resenia::where('producto_id', $productoId)
            ->where('visible', true)
            ->with('user:id,nombre')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($resenias);
    }

    // Crear reseña (usuario autenticado)
    public function store(Request $request)
    {
        $request->validate([
            'producto_id' => 'required|exists:productos,id',
            'puntuacion'  => 'required|integer|min:1|max:10',
            'comentario'  => 'nullable|string|max:2000',
        ]);

        $yaExiste = Resenia::where('user_id', $request->user()->id)
            ->where('producto_id', $request->producto_id)
            ->exists();

        if ($yaExiste) {
            return response()->json([
                'message' => 'Ya has reseñado este producto.',
            ], 409);
        }

        $resenia = Resenia::create([
            'user_id'     => $request->user()->id,
            'producto_id' => $request->producto_id,
            'puntuacion'  => $request->puntuacion,
            'comentario'  => $request->comentario,
        ]);

        return response()->json($resenia->load('user:id,nombre'), 201);
    }

    // Editar reseña propia (usuario autenticado)
    public function update(Request $request, Resenia $resenia)
    {
        if ($resenia->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'No puedes editar una reseña que no es tuya.',
            ], 403);
        }

        $request->validate([
            'puntuacion' => 'sometimes|required|integer|min:1|max:10',
            'comentario' => 'sometimes|nullable|string|max:2000',
        ]);

        $resenia->update($request->only(['puntuacion', 'comentario']));

        return response()->json($resenia);
    }

    // Eliminar reseña propia o por ADMIN/MOD
    public function destroy(Request $request, Resenia $resenia)
    {
        $user = $request->user();

        if ($resenia->user_id !== $user->id && ! $user->esAdminOMod()) {
            return response()->json([
                'message' => 'No puedes eliminar una reseña que no es tuya.',
            ], 403);
        }

        $resenia->delete();

        return response()->json([
            'message' => 'Reseña eliminada correctamente.',
        ]);
    }

    // Votar reseña (usuario autenticado)
    public function votar(Request $request, Resenia $resenia)
    {
        $request->validate([
            'voto' => 'required|in:up,down',
        ]);

        if ($request->voto === 'up') {
            $resenia->increment('voto_up');
        } else {
            $resenia->increment('voto_down');
        }

        return response()->json($resenia->fresh());
    }

    // Moderar visibilidad (ADMIN o MOD)
    public function moderar(Request $request, Resenia $resenia)
    {
        $request->validate([
            'visible' => 'required|boolean',
        ]);

        $resenia->update(['visible' => $request->visible]);

        return response()->json([
            'message'  => 'Visibilidad actualizada.',
            'resenia'  => $resenia,
        ]);
    }
}