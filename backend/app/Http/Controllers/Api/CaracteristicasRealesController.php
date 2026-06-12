<?php

namespace App\Http\Controllers\Api;

use App\Models\CaracteristicaReal;
use App\Models\Producto;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CaracteristicasRealesController extends Controller
{
    /**
     * Obtener características reales de un producto
     */
    public function index(Request $request, $productoId)
    {
        $query = CaracteristicaReal::with(['user', 'producto'])
            ->where('producto_id', $productoId);

        $caracteristicas = $query
            ->orderByDesc('fecha')
            ->paginate(20);

        return response()->json($caracteristicas);
    }

    /**
     * Obtener detalles de una característica real
     */
    public function show(CaracteristicaReal $caracteristicaReal)
    {
        $caracteristicaReal->load(['user', 'producto']);
        return response()->json($caracteristicaReal);
    }

    /**
     * Crear una nueva característica real reportada por un usuario
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'atributo' => 'required|string|max:100',
            'valor' => 'required|string|max:500',
            'producto_id' => 'required|exists:productos,id',
        ]);

        $caracteristica = CaracteristicaReal::create([
            'atributo' => $validated['atributo'],
            'valor' => $validated['valor'],
            'producto_id' => $validated['producto_id'],
            'user_id' => $request->user()->id,
        ]);

        $caracteristica->load(['user', 'producto']);

        return response()->json($caracteristica, 201);
    }

    /**
     * Eliminar una característica real
     * Solo el usuario que la creó o admins pueden hacerlo
     */
    public function destroy(Request $request, CaracteristicaReal $caracteristicaReal)
    {
        // Verificar autorización
        if (
            $request->user()->id !== $caracteristicaReal->user_id &&
            !in_array($request->user()->rol, ['ADMIN', 'MOD'])
        ) {
            return response()->json([
                'message' => 'No tienes permiso para eliminar esta característica'
            ], 403);
        }

        $caracteristicaReal->delete();

        return response()->json(['message' => 'Característica eliminada exitosamente']);
    }
}
