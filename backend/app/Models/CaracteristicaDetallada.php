<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CaracteristicaDetallada extends Model
{
    protected $table = 'caracteristicas_detalladas';
    public $timestamps = false;

    protected $fillable = [
        'producto_id',
        'dimensiones',
        'peso',
        'conexion',
        'color',
        'especificaciones_json',
    ];

    protected $casts = [
        'especificaciones_json' => 'json',
    ];

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }
}
