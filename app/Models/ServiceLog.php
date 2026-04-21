<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceLog extends Model
{
    use HasFactory;

    protected $fillable = ['project_id', 'user_id', 'date', 'owner_id', 'notes'];

    protected function casts(): array
    {
        return [
            'project_id' => 'integer',
            'user_id' => 'integer',
            'owner_id' => 'integer',
            'date' => 'date:Y-m-d',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class)->orderBy('name');
    }

    public function scopeForCurrentUser($query)
    {
        return $query->where('user_id', auth()->id());
    }
}
