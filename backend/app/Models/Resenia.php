<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Resenia extends Model
{
    protected $table = 'resenias';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'producto_id',
        'puntuacion',
        'comentario',
        'voto_up',
        'voto_down',
    ];

    protected $casts = [
        'fecha' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }
}
