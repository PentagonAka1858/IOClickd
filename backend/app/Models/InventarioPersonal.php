<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventarioPersonal extends Model
{
    protected $table = 'inventario_personal';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'producto_id',
        'cantidad',
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
