<?php

namespace App\Http\Controllers\Api;

use App\Models\CaracteristicaDetallada;
use App\Models\Producto;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CaracteristicasDetalladasController extends Controller
{
    /**
     * Obtener características detalladas de un producto
     */
    public function show(Producto $producto)
    {
        $caracteristica = $producto->caracteristicaDetallada;

        if (!$caracteristica) {
            return response()->json([
                'message' => 'Este producto no tiene características detalladas'
            ], 404);
        }

        return response()->json($caracteristica);
    }

    /**
     * Crear o actualizar características detalladas de un producto
     * Solo admins pueden hacer esto
     */
    public function store(Request $request, Producto $producto)
    {
        // Verificar que sea admin
        if ($request->user()->rol !== 'ADMIN') {
            return response()->json([
                'message' => 'Solo los administradores pueden crear/actualizar características detalladas'
            ], 403);
        }

        $validated = $request->validate([
            'dimensiones' => 'nullable|string|max:200',
            'peso' => 'nullable|string|max:100',
            'conexion' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:100',
            'especificaciones_json' => 'nullable|json',
        ]);

        // Si ya existe, actualizar; si no, crear
        $caracteristica = CaracteristicaDetallada::updateOrCreate(
            ['producto_id' => $producto->id],
            $validated
        );

        return response()->json($caracteristica);
    }

    /**
     * Eliminar características detalladas de un producto
     * Solo admins pueden hacerlo
     */
    public function destroy(Request $request, Producto $producto)
    {
        // Verificar que sea admin
        if ($request->user()->rol !== 'ADMIN') {
            return response()->json([
                'message' => 'Solo los administradores pueden eliminar características detalladas'
            ], 403);
        }

        $caracteristica = $producto->caracteristicaDetallada;

        if (!$caracteristica) {
            return response()->json([
                'message' => 'Este producto no tiene características detalladas'
            ], 404);
        }

        $caracteristica->delete();

        return response()->json(['message' => 'Características eliminadas exitosamente']);
    }
}
