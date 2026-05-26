<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Consulta extends Model
{
    protected $table = 'consultas';
    public $timestamps = false;

    protected $fillable = [
        'soporte_id',
        'cliente_id',
        'estado',
        'fecha_cierre',
    ];

    protected $casts = [
        'fecha_creacion' => 'datetime',
        'fecha_cierre' => 'datetime',
    ];

    public function soporte(): BelongsTo
    {
        return $this->belongsTo(User::class, 'soporte_id');
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cliente_id');
    }

    public function mensajes(): HasMany
    {
        return $this->hasMany(Mensaje::class, 'consulta_id');
    }
}
