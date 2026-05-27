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
        Schema::create('productos_en_listas', function (Blueprint $table) {
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->foreignId('lista_id')->constrained('listas_personales')->cascadeOnDelete();

            $table->timestamps();

            $table->primary(['producto_id', 'lista_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos_en_listas');
    }
};
