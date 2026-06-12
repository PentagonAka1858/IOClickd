<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductoController extends Controller
{
    // Listar todos los productos (público)
    public function index(Request $request)
    {
        $query = Producto::with('caracteristicaDetallada');

        // Filtro por tipo
        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        // Filtro por marca
        if ($request->has('marca') && $request->marca !== '') {
            $query->where('marca', 'like', '%' . $request->marca . '%');
        }

        // Búsqueda por modelo
        if ($request->has('buscar')) {
            $query->where('modelo', 'like', '%' . $request->buscar . '%');
        }

        // Filtro por peso máximo
        if ($request->has('peso') && is_numeric($request->peso)) {
            $pesoMax = (float) $request->peso;
            $query->whereHas('caracteristicaDetallada', function($q) use ($pesoMax) {
                $q->whereRaw('(CASE 
                    WHEN LOWER(peso) LIKE "%kg%" THEN CAST(REPLACE(LOWER(peso), "kg", "") AS DECIMAL(10,2)) * 1000 
                    ELSE CAST(REPLACE(LOWER(peso), "g", "") AS DECIMAL(10,2)) 
                END) <= ?', [$pesoMax]);
            });
        }

        // Filtro por conexión
        if ($request->has('conexion') && $request->conexion !== '') {
            $conexion = $request->conexion;
            if ($conexion === 'inalambrica') {
                $query->whereHas('caracteristicaDetallada', function($q) {
                    $q->where('conexion', 'like', '%inalambric%')
                      ->orWhere('conexion', 'like', '%wireless%')
                      ->orWhere('conexion', 'like', '%bluetooth%')
                      ->orWhere('conexion', 'like', '%2.4%');
                });
            } else if ($conexion === 'cable') {
                $query->whereHas('caracteristicaDetallada', function($q) {
                    $q->where('conexion', 'not like', '%inalambric%')
                      ->where('conexion', 'not like', '%wireless%')
                      ->where('conexion', 'not like', '%bluetooth%')
                      ->where('conexion', 'not like', '%2.4%');
                });
            }
        }

        // Filtro por color
        if ($request->has('color') && $request->color !== '') {
            $color = $request->color;
            $query->whereHas('caracteristicaDetallada', function($q) use ($color) {
                $q->where('color', 'like', '%' . $color . '%');
            });
        }

        $perPage = $request->has('per_page') && is_numeric($request->per_page) ? (int) $request->per_page : 20;
        
        $productos = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($productos);
    }

    // Ver un producto (público)
    public function show(Producto $producto)
    {
        return response()->json($producto);
    }

    // Crear producto (solo ADMIN o MOD)
    public function store(Request $request)
    {
        $request->validate([
            'modelo'      => 'nullable|string|max:255',
            'marca'       => 'required|string|max:255',
            'tipo'        => 'required|in:RATON,TECLADO,AURICULAR,MONITOR,ALFOMBRILLA,OTRO',
            'descripcion' => 'nullable|string',
            'fecha_salida'=> 'nullable|date',
            'foto'        => 'nullable|image|max:2048',
        ]);

        $data = $request->only([
            'modelo', 'marca', 'tipo', 'descripcion', 'fecha_salida'
        ]);

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('photos/products', 'public');
            $data['foto'] = $path;
        }

        $producto = Producto::create($data);

        return response()->json($producto, 201);
    }

    // Editar producto (solo ADMIN o MOD)
    public function update(Request $request, Producto $producto)
    {
        $request->validate([
            'modelo'      => 'sometimes|nullable|string|max:255',
            'marca'       => 'sometimes|required|string|max:255',
            'tipo'        => 'sometimes|required|in:RATON,TECLADO,AURICULAR,MONITOR,ALFOMBRILLA,OTRO',
            'descripcion' => 'sometimes|nullable|string',
            'fecha_salida'=> 'sometimes|nullable|date',
            'foto'        => 'sometimes|nullable|image|max:2048',
        ]);

        $data = $request->only([
            'modelo', 'marca', 'tipo', 'descripcion', 'fecha_salida'
        ]);

        if ($request->hasFile('foto')) {
            if ($producto->foto && Storage::disk('public')->exists($producto->foto)) {
                Storage::disk('public')->delete($producto->foto);
            }
            $path = $request->file('foto')->store('photos/products', 'public');
            $data['foto'] = $path;
        }

        $producto->update($data);

        return response()->json($producto);
    }

    // Eliminar producto (solo ADMIN)
    public function destroy(Producto $producto)
    {
        if ($producto->foto && Storage::disk('public')->exists($producto->foto)) {
            Storage::disk('public')->delete($producto->foto);
        }

        $producto->delete();

        return response()->json([
            'message' => 'Producto eliminado correctamente.',
        ]);
    }
}