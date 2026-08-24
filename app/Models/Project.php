<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'user_id', 'owner_id', 'url', 'referrer', 'commission_fee', 'is_active'];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'owner_id' => 'integer',
            'commission_fee' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(ProjectOwner::class, 'owner_id')->orderBy('name');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class)->orderByDesc('date');
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class)->orderBy('type');
    }

    public function priceCalculations(): HasMany
    {
        return $this->hasMany(PriceCalculation::class)->latest();
    }

    public function scopeForCurrentUser($query)
    {
        return $query->where('user_id', auth()->id());
    }
}
