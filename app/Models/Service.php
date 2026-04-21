<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Service extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'type', 'owner_id', 'project_id', 'start_date', 'end_date', 'currency', 'amount', 'notes', 'is_active'];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'owner_id' => 'integer',
            'project_id' => 'integer',
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
            'amount' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function scopeForCurrentUser($query)
    {
        return $query->where('user_id', auth()->id());
    }
}
