<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventarioPersonal;
use App\Models\Producto;
use Illuminate\Http\Request;

class InventarioController extends Controller
{
    // Ver inventario propio
    public function index(Request $request)
    {
        $inventario = InventarioPersonal::where('user_id', $request->user()->id)
            ->with('producto')
            ->orderBy('principal', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($inventario);
    }

    // Añadir producto al inventario
    public function store(Request $request)
    {
        $request->validate([
            'producto_id' => 'required|exists:productos,id',
            'cantidad'    => 'sometimes|integer|min:1',
            'principal'   => 'sometimes|boolean',
        ]);

        $yaExiste = InventarioPersonal::where('user_id', $request->user()->id)
            ->where('producto_id', $request->producto_id)
            ->exists();

        if ($yaExiste) {
            return response()->json([
                'message' => 'Este producto ya está en tu inventario.',
            ], 409);
        }

        $item = InventarioPersonal::create([
            'user_id'     => $request->user()->id,
            'producto_id' => $request->producto_id,
            'cantidad'    => $request->cantidad ?? 1,
            'principal'   => $request->principal ?? false,
        ]);

        return response()->json($item->load('producto'), 201);
    }

    // Editar item del inventario (cantidad o principal)
    public function update(Request $request, int $productoId)
    {
        $item = InventarioPersonal::where('user_id', $request->user()->id)
            ->where('producto_id', $productoId)
            ->first();

        if (! $item) {
            return response()->json([
                'message' => 'Este producto no está en tu inventario.',
            ], 404);
        }

        $request->validate([
            'cantidad'  => 'sometimes|integer|min:1',
            'principal' => 'sometimes|boolean',
        ]);

        if ($request->has('principal') && $request->principal == true) {
            $tipoProducto = Producto::where('id', $productoId)->value('tipo');
            if ($tipoProducto) {
                $productosDelMismoTipo = Producto::where('tipo', $tipoProducto)->pluck('id');
                InventarioPersonal::where('user_id', $request->user()->id)
                    ->whereIn('producto_id', $productosDelMismoTipo)
                    ->where('producto_id', '!=', $productoId)
                    ->update(['principal' => false]);
            } else {
                InventarioPersonal::where('user_id', $request->user()->id)
                    ->where('producto_id', '!=', $productoId)
                    ->update(['principal' => false]);
            }
        }

        InventarioPersonal::where('user_id', $request->user()->id)
            ->where('producto_id', $productoId)
            ->update($request->only(['cantidad', 'principal']));

        $item = InventarioPersonal::where('user_id', $request->user()->id)
            ->where('producto_id', $productoId)
            ->with('producto')
            ->first();

        return response()->json($item);
    }

    // Eliminar producto del inventario
    public function destroy(Request $request, int $productoId)
    {
        $eliminado = InventarioPersonal::where('user_id', $request->user()->id)
            ->where('producto_id', $productoId)
            ->delete();

        if (! $eliminado) {
            return response()->json([
                'message' => 'Este producto no está en tu inventario.',
            ], 404);
        }

        return response()->json([
            'message' => 'Producto eliminado del inventario.',
        ]);
    }

    // Ver cuántos usuarios tienen un producto (público)
    public function usuariosConProducto(int $productoId)
    {
        $producto = Producto::findOrFail($productoId);

        $total = InventarioPersonal::where('producto_id', $productoId)->count();
        $principales = InventarioPersonal::where('producto_id', $productoId)
            ->where('principal', true)
            ->count();

        return response()->json([
            'producto'    => $producto->only(['id', 'modelo', 'marca']),
            'total_usuarios'      => $total,
            'usuarios_principal'  => $principales,
        ]);
    }
}