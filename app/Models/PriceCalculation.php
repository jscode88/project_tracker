<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceCalculation extends Model
{
    protected $fillable = ['user_id', 'project_id', 'problem_id', 'name', 'inputs', 'price_snapshot', 'total'];

    protected function casts(): array
    {
        return ['user_id' => 'integer', 'project_id' => 'integer', 'problem_id' => 'integer', 'inputs' => 'array', 'price_snapshot' => 'array', 'total' => 'integer'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function problem(): BelongsTo
    {
        return $this->belongsTo(Problem::class);
    }
}
