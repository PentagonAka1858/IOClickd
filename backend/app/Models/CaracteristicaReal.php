<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CaracteristicaReal extends Model
{
    protected $table = 'caracteristicas_reales';
    public $timestamps = false;

    protected $fillable = [
        'atributo',
        'valor',
        'user_id',
        'producto_id',
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
