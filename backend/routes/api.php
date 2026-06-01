<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FavoritoController;
use App\Http\Controllers\Api\InventarioController;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\ListaPersonalController;
use App\Http\Controllers\Api\ConsultaController;
use App\Http\Controllers\Api\SeguimientoController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\ReseniaController;
use App\Http\Controllers\Api\CaracteristicasRealesController;
use App\Http\Controllers\Api\CaracteristicasDetalladasController;
use App\Http\Controllers\Api\MensajeController;
use App\Http\Controllers\Api\AdminController;

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Rutas públicas
Route::get('/productos',       [ProductoController::class, 'index']);
Route::get('/productos/{producto}', [ProductoController::class, 'show']);
Route::get('/productos/{producto}/caracteristicas-detalladas', [CaracteristicasDetalladasController::class, 'show']);
Route::get('/productos/{productoId}/resenias', [ReseniaController::class, 'index']);
Route::get('/productos/{productoId}/caracteristicas-reales', [CaracteristicasRealesController::class, 'index']);
Route::get('/listas/{lista}', [ListaPersonalController::class, 'show']);
Route::get('/productos/{productoId}/usuarios', [InventarioController::class, 'usuariosConProducto']);

// Rutas autenticadas
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Favoritos
    Route::get('/favoritos',            [FavoritoController::class, 'index']);
    Route::post('/favoritos',           [FavoritoController::class, 'store']);
    Route::delete('/favoritos/{producto_id}', [FavoritoController::class, 'destroy']);

    // Reseñas
    Route::post('/resenias',                    [ReseniaController::class, 'store']);
    Route::put('/resenias/{resenia}',           [ReseniaController::class, 'update']);
    Route::delete('/resenias/{resenia}',        [ReseniaController::class, 'destroy']);
    Route::post('/resenias/{resenia}/votar',    [ReseniaController::class, 'votar']);

    // Listas personales
    Route::get('/listas',                                           [ListaPersonalController::class, 'index']);
    Route::post('/listas',                                          [ListaPersonalController::class, 'store']);
    Route::put('/listas/{lista}',                                   [ListaPersonalController::class, 'update']);
    Route::delete('/listas/{lista}',                                [ListaPersonalController::class, 'destroy']);
    Route::post('/listas/{lista}/productos',                        [ListaPersonalController::class, 'agregarProducto']);
    Route::delete('/listas/{lista}/productos/{producto_id}',        [ListaPersonalController::class, 'quitarProducto']);

    // Inventario
    Route::get('/inventario',                   [InventarioController::class, 'index']);
    Route::post('/inventario',                  [InventarioController::class, 'store']);
    Route::put('/inventario/{producto_id}',     [InventarioController::class, 'update']);
    Route::delete('/inventario/{producto_id}',  [InventarioController::class, 'destroy']);

    // Consultas y soporte
    Route::get('/consultas',                        [ConsultaController::class, 'index']);
    Route::post('/consultas',                       [ConsultaController::class, 'store']);
    Route::get('/consultas/{consulta}',             [ConsultaController::class, 'show']);
    Route::post('/consultas/{consulta}/mensajes',   [ConsultaController::class, 'addMensaje']);
    Route::post('/consultas/{consulta}/cerrar',     [ConsultaController::class, 'cerrar']);
    Route::post('/consultas/{consulta}/asignar',    [ConsultaController::class, 'asignar']);

    // Mensajes
    Route::get('/consultas/{consulta}/mensajes',                        [MensajeController::class, 'index']);
    Route::get('/consultas/{consulta}/mensajes/{mensaje}',              [MensajeController::class, 'show']);
    Route::delete('/consultas/{consulta}/mensajes/{mensaje}',           [MensajeController::class, 'destroy']);

    // Características reales
    Route::post('/caracteristicas-reales',               [CaracteristicasRealesController::class, 'store']);
    Route::delete('/caracteristicas-reales/{caracteristicaReal}', [CaracteristicasRealesController::class, 'destroy']);

    // Características detalladas (solo para admins)
    Route::post('/productos/{producto}/caracteristicas-detalladas',    [CaracteristicasDetalladasController::class, 'store']);
    Route::delete('/productos/{producto}/caracteristicas-detalladas',  [CaracteristicasDetalladasController::class, 'destroy']);

    // Seguimientos (follow/unfollow)
    Route::get('/users/{user}/followers',           [SeguimientoController::class, 'followers']);
    Route::get('/users/{user}/following',           [SeguimientoController::class, 'following']);
    Route::get('/me/following',                     [SeguimientoController::class, 'myFollowing']);
    Route::post('/users/{user}/follow',             [SeguimientoController::class, 'follow']);
    Route::delete('/users/{user}/follow',           [SeguimientoController::class, 'unfollow']);
    
    // Rutas de moderación (ADMIN o MOD)
    Route::middleware('rol:ADMIN,MOD')->group(function () {
        Route::post('/productos',            [ProductoController::class, 'store']);
        Route::put('/productos/{producto}',  [ProductoController::class, 'update']);
        Route::patch('/resenias/{resenia}/moderar',  [ReseniaController::class, 'moderar']);

        Route::get('/admin/estadisticas', [AdminController::class, 'stats']);
        Route::get('/admin/usuarios', [AdminController::class, 'usuarios']);
        Route::get('/admin/productos', [AdminController::class, 'productos']);
        Route::get('/admin/resenias', [AdminController::class, 'resenias']);
    });

    // Rutas de administración (solo ADMIN)
    Route::middleware('rol:ADMIN')->group(function () {
        Route::delete('/productos/{producto}', [ProductoController::class, 'destroy']);
        Route::delete('/admin/usuarios/{user}', [AdminController::class, 'destroyUser']);
        Route::patch('/admin/usuarios/{user}/visibilidad', [AdminController::class, 'toggleUserVisibility']);
    });

});