<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductoController;

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Rutas públicas de productos
Route::get('/productos',       [ProductoController::class, 'index']);
Route::get('/productos/{producto}', [ProductoController::class, 'show']);

// Rutas autenticadas
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    // Rutas de moderación (ADMIN o MOD)
    Route::middleware('rol:ADMIN,MOD')->group(function () {
        Route::post('/productos',            [ProductoController::class, 'store']);
        Route::put('/productos/{producto}',  [ProductoController::class, 'update']);
    });

    // Rutas de administración (solo ADMIN)
    Route::middleware('rol:ADMIN')->group(function () {
        Route::delete('/productos/{producto}', [ProductoController::class, 'destroy']);
    });

});