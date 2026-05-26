<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('caracteristicas_detalladas', function (Blueprint $table) {
            $table->foreignId('producto_id')->primary()
                ->constrained('productos')
                ->cascadeOnDelete();

            $table->string('dimensiones')->nullable();
            $table->string('peso')->nullable();
            $table->string('conexion')->nullable();
            $table->string('color')->nullable();
            $table->json('especificaciones_json')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('caracteristicas_detalladas');
    }
};
