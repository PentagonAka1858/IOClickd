<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ListaPersonal;
use Illuminate\Http\Request;

class ListaPersonalController extends Controller
{
    // Listar listas propias
    public function index(Request $request)
    {
        $listas = $request->user()
            ->listas()
            ->withCount('productos')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($listas);
    }

    // Ver lista pública de cualquier usuario o propia
    public function show(Request $request, ListaPersonal $lista)
    {
        $user = $request->user();

        if (! $lista->publica && $lista->user_id !== $user?->id) {
            return response()->json([
                'message' => 'Esta lista es privada.',
            ], 403);
        }

        return response()->json($lista->load('productos', 'user:id,nombre'));
    }

    // Crear lista
    public function store(Request $request)
    {
        $request->validate([
            'nombre_lista' => 'required|string|max:255',
            'descripcion'  => 'nullable|string|max:1000',
            'publica'      => 'sometimes|boolean',
        ]);

        $lista = ListaPersonal::create([
            'user_id'      => $request->user()->id,
            'nombre_lista' => $request->nombre_lista,
            'descripcion'  => $request->descripcion,
            'publica'      => $request->publica ?? false,
        ]);

        return response()->json($lista, 201);
    }

    // Editar lista
    public function update(Request $request, ListaPersonal $lista)
    {
        if ($lista->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'No puedes editar una lista que no es tuya.',
            ], 403);
        }

        $request->validate([
            'nombre_lista' => 'sometimes|required|string|max:255',
            'descripcion'  => 'sometimes|nullable|string|max:1000',
            'publica'      => 'sometimes|boolean',
        ]);

        $lista->update($request->only(['nombre_lista', 'descripcion', 'publica']));

        return response()->json($lista);
    }

    // Eliminar lista
    public function destroy(Request $request, ListaPersonal $lista)
    {
        if ($lista->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'No puedes eliminar una lista que no es tuya.',
            ], 403);
        }

        $lista->delete();

        return response()->json([
            'message' => 'Lista eliminada correctamente.',
        ]);
    }

    // Añadir producto a lista
    public function agregarProducto(Request $request, ListaPersonal $lista)
    {
        if ($lista->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'No puedes modificar una lista que no es tuya.',
            ], 403);
        }

        $request->validate([
            'producto_id' => 'required|exists:productos,id',
        ]);

        if ($lista->productos()->where('producto_id', $request->producto_id)->exists()) {
            return response()->json([
                'message' => 'Este producto ya está en la lista.',
            ], 409);
        }

        $lista->productos()->attach($request->producto_id);

        return response()->json([
            'message' => 'Producto añadido a la lista.',
            'lista'   => $lista->load('productos'),
        ]);
    }

    // Quitar producto de lista
    public function quitarProducto(Request $request, ListaPersonal $lista, int $productoId)
    {
        if ($lista->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'No puedes modificar una lista que no es tuya.',
            ], 403);
        }

        $lista->productos()->detach($productoId);

        return response()->json([
            'message' => 'Producto eliminado de la lista.',
        ]);
    }
}