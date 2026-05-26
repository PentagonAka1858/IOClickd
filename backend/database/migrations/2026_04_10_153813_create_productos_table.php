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
        Schema::create('productos', function (Blueprint $table) {
            $table->id();
            $table->string('modelo')->nullable();
            $table->string('marca')->index();
            $table->enum('tipo', ['RATON', 'TECLADO', 'AURICULAR', 'MONITOR', 'ALFOMBRILLA', 'OTRO'])->index();
            $table->text('descripcion')->nullable();
            $table->timestamp('fecha_salida')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
