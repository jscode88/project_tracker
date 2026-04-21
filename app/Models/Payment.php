<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = ['project_id', 'user_id', 'date', 'amount', 'owner_id', 'notes', 'currency'];

    protected function casts(): array
    {
        return [
            'project_id' => 'integer',
            'user_id' => 'integer',
            'owner_id' => 'integer',
            'date' => 'date:Y-m-d',
            'amount' => 'integer',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class)->orderBy('name');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(ProjectOwner::class, 'owner_id');
    }

    public function scopeForCurrentUser($query)
    {
        return $query->where('user_id', auth()->id());
    }
}
