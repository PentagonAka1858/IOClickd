<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nombre',
        'email',
        'password',
        'rol',
        'idioma_preferido',
        'visibilidad',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'visibilidad'       => 'boolean',
        ];
    }

    // Helpers de rol
    public function esAdmin(): bool
    {
        return $this->rol === 'ADMIN';
    }

    public function esMod(): bool
    {
        return $this->rol === 'MOD';
    }

    public function esAdminOMod(): bool
    {
        return in_array($this->rol, ['ADMIN', 'MOD']);
    }
    
    public function favoritos(): HasMany
    {
        return $this->hasMany(Favorito::class);
    }
}
