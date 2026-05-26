<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Seguimiento extends Model
{
    protected $table = 'seguimientos';
    public $timestamps = false;

    protected $fillable = [
        'seguidor_id',
        'seguido_id',
    ];

    protected $casts = [
        'fecha' => 'datetime',
    ];

    public function seguidor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seguidor_id');
    }

    public function seguido(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seguido_id');
    }
}
