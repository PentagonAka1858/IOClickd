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
        Schema::create('listas_personales', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_lista');
            $table->text('descripcion')->nullable();
            $table->boolean('publica')->default(false);
            $table->timestamps();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('listas_personales');
    }
};
