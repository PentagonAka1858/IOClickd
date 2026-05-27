<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FavoritoController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\ReseniaController;

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Rutas públicas de productos
Route::get('/productos',       [ProductoController::class, 'index']);
Route::get('/productos/{producto}', [ProductoController::class, 'show']);
Route::get('/productos/{productoId}/resenias', [ReseniaController::class, 'index']);

// Rutas autenticadas
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    // Favoritos
    Route::get('/favoritos',            [FavoritoController::class, 'index']);
    Route::post('/favoritos',           [FavoritoController::class, 'store']);
    Route::delete('/favoritos/{producto_id}', [FavoritoController::class, 'destroy']);

    // Reseñas
    Route::post('/resenias',                    [ReseniaController::class, 'store']);
    Route::put('/resenias/{resenia}',           [ReseniaController::class, 'update']);
    Route::delete('/resenias/{resenia}',        [ReseniaController::class, 'destroy']);
    Route::post('/resenias/{resenia}/votar',    [ReseniaController::class, 'votar']);
    
    // Rutas de moderación (ADMIN o MOD)
    Route::middleware('rol:ADMIN,MOD')->group(function () {
        Route::post('/productos',            [ProductoController::class, 'store']);
        Route::put('/productos/{producto}',  [ProductoController::class, 'update']);
        Route::patch('/resenias/{resenia}/moderar',  [ReseniaController::class, 'moderar']);
    });

    // Rutas de administración (solo ADMIN)
    Route::middleware('rol:ADMIN')->group(function () {
        Route::delete('/productos/{producto}', [ProductoController::class, 'destroy']);
    });

});