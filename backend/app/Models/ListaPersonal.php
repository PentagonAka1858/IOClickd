<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ListaPersonal extends Model
{
    protected $table = 'listas_personales';

    protected $fillable = [
        'user_id',
        'nombre_lista',
        'descripcion',
        'publica',
    ];

    protected function casts(): array
    {
        return [
            'publica' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function productos(): BelongsToMany
    {
        return $this->belongsToMany(
            Producto::class,
            'productos_en_listas',
            'lista_id',
            'producto_id'
        )->withTimestamps();
    }
}
