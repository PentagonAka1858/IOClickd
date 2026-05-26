<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Producto extends Model
{
    protected $table = 'productos';
    public $timestamps = false;

    protected $fillable = [
        'modelo',
        'marca',
        'tipo',
        'descripcion',
        'fecha_salida',
    ];

    protected $casts = [
        'fecha_salida' => 'datetime',
    ];

    public function favoritos(): HasMany
    {
        return $this->hasMany(Favorito::class, 'producto_id');
    }

    public function inventarioPersonal(): HasMany
    {
        return $this->hasMany(InventarioPersonal::class, 'producto_id');
    }

    public function productosEnListas(): HasMany
    {
        return $this->hasMany(ProductoEnLista::class, 'producto_id');
    }

    public function caracteristicaDetallada(): HasOne
    {
        return $this->hasOne(CaracteristicaDetallada::class, 'producto_id');
    }

    public function caracteristicasReales(): HasMany
    {
        return $this->hasMany(CaracteristicaReal::class, 'producto_id');
    }

    public function resenias(): HasMany
    {
        return $this->hasMany(Resenia::class, 'producto_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'inventario_personal', 'producto_id', 'user_id');
    }
}
