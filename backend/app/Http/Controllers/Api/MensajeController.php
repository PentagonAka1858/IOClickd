<?php

namespace App\Http\Controllers\Api;

use App\Models\Mensaje;
use App\Models\Consulta;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class MensajeController extends Controller
{
    /**
     * Obtener mensajes de una consulta
     */
    public function index(Request $request, Consulta $consulta)
    {
        // Verificar autorización
        if (
            $request->user()->id !== $consulta->cliente_id &&
            $request->user()->id !== $consulta->soporte_id &&
            !in_array($request->user()->rol, ['ADMIN', 'MOD'])
        ) {
            return response()->json([
                'message' => 'No tienes permiso para ver estos mensajes'
            ], 403);
        }

        $mensajes = $consulta->mensajes()
            ->with('emisor:id,nombre,email')
            ->orderBy('fecha_envio')
            ->paginate(50);

        return response()->json($mensajes);
    }

    /**
     * Ver un mensaje específico
     */
    public function show(Request $request, Consulta $consulta, Mensaje $mensaje)
    {
        // Verificar que el mensaje pertenece a la consulta
        if ($mensaje->consulta_id !== $consulta->id) {
            return response()->json([
                'message' => 'Este mensaje no pertenece a esta consulta'
            ], 404);
        }

        // Verificar autorización
        if (
            $request->user()->id !== $consulta->cliente_id &&
            $request->user()->id !== $consulta->soporte_id &&
            !in_array($request->user()->rol, ['ADMIN', 'MOD'])
        ) {
            return response()->json([
                'message' => 'No tienes permiso para ver este mensaje'
            ], 403);
        }

        $mensaje->load('emisor:id,nombre,email');

        return response()->json($mensaje);
    }

    /**
     * Eliminar un mensaje
     * Solo el emisor o admin/moderador pueden hacerlo
     */
    public function destroy(Request $request, Consulta $consulta, Mensaje $mensaje)
    {
        // Verificar que el mensaje pertenece a la consulta
        if ($mensaje->consulta_id !== $consulta->id) {
            return response()->json([
                'message' => 'Este mensaje no pertenece a esta consulta'
            ], 404);
        }

        // Verificar autorización: solo el emisor o admin/mod
        if (
            $request->user()->id !== $mensaje->emisor_id &&
            !in_array($request->user()->rol, ['ADMIN', 'MOD'])
        ) {
            return response()->json([
                'message' => 'No tienes permiso para eliminar este mensaje'
            ], 403);
        }

        $mensaje->delete();

        return response()->json(['message' => 'Mensaje eliminado exitosamente']);
    }
}
