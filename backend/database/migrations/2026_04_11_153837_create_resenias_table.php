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
        Schema::create('resenias', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('producto_id')
                ->constrained('productos')
                ->cascadeOnDelete();

            $table->integer('puntuacion');
            $table->text('comentario')->nullable();

            $table->integer('voto_up')->default(0);
            $table->integer('voto_down')->default(0);

            $table->timestamp('fecha')->useCurrent();

            $table->unique(['user_id', 'producto_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resenias');
    }
};
