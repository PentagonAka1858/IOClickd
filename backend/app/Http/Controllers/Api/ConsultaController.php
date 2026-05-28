<?php

namespace App\Http\Controllers\Api;

use App\Models\Consulta;
use App\Models\Mensaje;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ConsultaController extends Controller
{
    /**
     * Obtener todas las consultas del usuario autenticado
     * Si es admin/moderador, muestra las que tiene asignadas y las pendientes
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Si es admin o moderador, mostrar consultas asignadas a él + pendientes de asignar
        if (in_array($user->rol, ['admin', 'moderador'])) {
            $consultas = Consulta::where(function ($query) use ($user) {
                // Consultas asignadas a este soporte
                $query->where('soporte_id', $user->id)
                    // O consultas sin soporte asignado aún
                    ->orWhereNull('soporte_id');
            })
            ->with(['cliente', 'soporte', 'mensajes.emisor'])
            ->orderBy('estado')
            ->orderByDesc('fecha_creacion')
            ->paginate(15);
        } else {
            // Usuario común: solo sus consultas como cliente
            $consultas = Consulta::where('cliente_id', $user->id)
                ->with(['cliente', 'soporte', 'mensajes.emisor'])
                ->orderBy('estado')
                ->orderByDesc('fecha_creacion')
                ->paginate(15);
        }

        return response()->json($consultas);
    }

    /**
     * Crear una nueva consulta (solo usuarios comunes)
     * También crea el primer mensaje con el contenido de la consulta
     */
    public function store(Request $request)
    {
        // Verificar que el usuario no sea admin o moderador
        if (in_array($request->user()->rol, ['admin', 'moderador'])) {
            return response()->json([
                'message' => 'Los administradores y moderadores no pueden crear consultas'
            ], 403);
        }

        $validated = $request->validate([
            'contenido' => 'required|string',
        ]);

        // Crear la consulta
        $consulta = Consulta::create([
            'cliente_id' => $request->user()->id,
            'soporte_id' => null, // Sin asignar aún
            'estado' => 0, // Abierta
        ]);

        // Crear el primer mensaje (la consulta inicial)
        $mensaje = Mensaje::create([
            'consulta_id' => $consulta->id,
            'emisor_id' => $request->user()->id,
            'contenido' => $validated['contenido'],
        ]);

        $consulta->load(['cliente', 'soporte', 'mensajes.emisor']);

        return response()->json($consulta, 201);
    }

    /**
     * Obtener los detalles de una consulta con sus mensajes
     */
    public function show(Request $request, Consulta $consulta)
    {
        // Verificar autorización
        if (
            $request->user()->id !== $consulta->cliente_id &&
            $request->user()->id !== $consulta->soporte_id &&
            !in_array($request->user()->rol, ['admin', 'moderador'])
        ) {
            return response()->json([
                'message' => 'No tienes permiso para ver esta consulta'
            ], 403);
        }

        $consulta->load(['cliente', 'soporte', 'mensajes.emisor']);

        return response()->json($consulta);
    }

    /**
     * Agregar un mensaje a una consulta
     * Los admins/moderadores responden la consulta
     */
    public function addMensaje(Request $request, Consulta $consulta)
    {
        $user = $request->user();

        // Verificar autorización: solo cliente, soporte asignado o admin pueden escribir
        if (
            $user->id !== $consulta->cliente_id &&
            $user->id !== $consulta->soporte_id &&
            !in_array($user->rol, ['admin', 'moderador'])
        ) {
            return response()->json([
                'message' => 'No tienes permiso para escribir en esta consulta'
            ], 403);
        }

        // No se pueden agregar mensajes a una consulta cerrada
        if ($consulta->estado === 1) {
            return response()->json([
                'message' => 'No puedes escribir en una consulta cerrada'
            ], 403);
        }

        // Si es un admin/moderador sin asignar la consulta aún, asignarla
        if (
            in_array($user->rol, ['admin', 'moderador']) &&
            $consulta->soporte_id === null
        ) {
            $consulta->update(['soporte_id' => $user->id]);
        }

        $validated = $request->validate([
            'contenido' => 'required|string',
        ]);

        $mensaje = Mensaje::create([
            'consulta_id' => $consulta->id,
            'emisor_id' => $user->id,
            'contenido' => $validated['contenido'],
        ]);

        $mensaje->load('emisor');

        return response()->json($mensaje, 201);
    }

    /**
     * Cerrar una consulta
     * Solo el cliente o el soporte asignado (admin/moderador) pueden cerrarla
     */
    public function cerrar(Request $request, Consulta $consulta)
    {
        $user = $request->user();

        // Verificar que sea el cliente o el soporte asignado
        if (
            $user->id !== $consulta->cliente_id &&
            $user->id !== $consulta->soporte_id
        ) {
            return response()->json([
                'message' => 'No tienes permiso para cerrar esta consulta'
            ], 403);
        }

        // Si ya está cerrada, no hacer nada
        if ($consulta->estado === 1) {
            return response()->json([
                'message' => 'Esta consulta ya está cerrada'
            ], 400);
        }

        $consulta->update([
            'estado' => 1,
            'fecha_cierre' => now(),
        ]);

        return response()->json([
            'message' => 'Consulta cerrada exitosamente',
            'consulta' => $consulta,
        ]);
    }

    /**
     * Asignar una consulta a un admin/moderador
     * Solo otros admins pueden hacer esto
     */
    public function asignar(Request $request, Consulta $consulta)
    {
        $user = $request->user();

        // Verificar que sea admin
        if ($user->rol !== 'admin') {
            return response()->json([
                'message' => 'Solo los administradores pueden asignar consultas'
            ], 403);
        }

        $validated = $request->validate([
            'soporte_id' => 'required|exists:users,id',
        ]);

        $consulta->update(['soporte_id' => $validated['soporte_id']]);

        $consulta->load(['cliente', 'soporte']);

        return response()->json($consulta);
    }
}
