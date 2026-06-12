<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mensaje extends Model
{
    protected $table = 'mensajes';
    public $timestamps = false;

    protected $fillable = [
        'consulta_id',
        'emisor_id',
        'contenido',
    ];

    protected $casts = [
        'fecha_envio' => 'datetime',
    ];

    public function consulta(): BelongsTo
    {
        return $this->belongsTo(Consulta::class, 'consulta_id');
    }

    public function emisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'emisor_id');
    }

    protected function serializeDate(\DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }
}
