<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectOwner extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'user_id', 'country', 'contact_number'];

    protected function casts(): array
    {
        return ['user_id' => 'integer'];
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'owner_id')->orderBy('name');
    }

    public function ideabookEntries(): HasMany
    {
        return $this->hasMany(Problem::class);
    }

    public function scopeForCurrentUser($query)
    {
        return $query->where('user_id', auth()->id());
    }
}
