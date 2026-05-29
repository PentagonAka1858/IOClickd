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
        Schema::create('consultas', function (Blueprint $table) {
            $table->id();

            $table->foreignId('soporte_id')
                ->nullable()
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('cliente_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->enum('estado', ['ABIERTA', 'EN_PROCESO', 'CERRADA'])->default('ABIERTA');
            $table->timestamps();
            $table->timestamp('fecha_cierre')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultas');
    }
};
