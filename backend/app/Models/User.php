<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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

    public function resenias(): HasMany
    {
        return $this->hasMany(Resenia::class);
    }
    
    public function listas(): HasMany
    {
        return $this->hasMany(ListaPersonal::class);
    }

    public function inventario(): HasMany
    {
        return $this->hasMany(InventarioPersonal::class);
    }

    public function following(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'seguimientos', 'seguidor_id', 'seguido_id')
            ->withPivot('fecha');
    }

    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'seguimientos', 'seguido_id', 'seguidor_id')
            ->withPivot('fecha');
    }

    public function isFollowing(User $user): bool
    {
        return $this->following()->where('users.id', $user->id)->exists();
    }
}
