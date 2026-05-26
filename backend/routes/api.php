<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Rutas protegidas por Auth solo
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Solo ADMIN
Route::middleware(['auth:sanctum', 'rol:ADMIN'])->group(function () {
    
});

// ADMIN o MOD
Route::middleware(['auth:sanctum', 'rol:ADMIN,MOD'])->group(function () {
    
});