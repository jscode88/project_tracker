<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Problem extends Model
{
    protected $fillable = [
        'user_id',
        'idea_id',
        'entry_type',
        'status',
        'project_owner_id',
        'project_id',
        'customer_name',
        'contact_person',
        'contact_method',
        'enquiry_source',
        'expected_budget',
        'expected_budget_currency',
        'desired_delivery_date',
        'follow_up_date',
        'next_action',
        'title',
        'content',
        'validation_content',
    ];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'idea_id' => 'integer',
            'project_owner_id' => 'integer',
            'project_id' => 'integer',
            'expected_budget' => 'decimal:2',
            'desired_delivery_date' => 'date',
            'follow_up_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function idea(): BelongsTo
    {
        return $this->belongsTo(Idea::class);
    }

    public function projectOwner(): BelongsTo
    {
        return $this->belongsTo(ProjectOwner::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
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
