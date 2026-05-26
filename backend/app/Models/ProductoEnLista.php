<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductoEnLista extends Model
{
    protected $table = 'productos_en_listas';
    public $timestamps = false;

    protected $fillable = [
        'producto_id',
        'lista_id',
    ];

    protected $casts = [
        'fecha' => 'datetime',
    ];

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    public function lista(): BelongsTo
    {
        return $this->belongsTo(ListaPersonal::class, 'lista_id');
    }
}
