<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ListaPersonal extends Model
{
    protected $table = 'listas_personales';
    public $timestamps = false;

    protected $fillable = [
        'nombre_lista',
        'descripcion',
        'user_id',
    ];

    protected $casts = [
        'fecha_creacion' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function productosEnListas(): HasMany
    {
        return $this->hasMany(ProductoEnLista::class, 'lista_id');
    }
}
