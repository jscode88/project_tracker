<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceCalculationSetting extends Model
{
    public const DEFAULT_PRICING = [
        'salary_divisor' => 2, 'laptop_divisor' => 3, 'price_basis_cap' => 3500000,
        'crud_per_table' => 500000, 'login_manual' => 700000, 'login_google' => 300000, 'login_both' => 1000000,
        'relation_per_item' => 50000, 'frontend_easy' => 1000000, 'frontend_medium' => 2000000, 'frontend_complex' => 3000000,
        'library_per_item' => 30000, 'platform_web' => 0, 'platform_mobile' => 1500000, 'platform_both' => 2500000,
        'addon_payment' => 2500000, 'addon_realtime' => 1000000, 'addon_cron' => 500000, 'addon_export_data' => 300000,
        'addon_multilang' => 500000, 'addon_push_notif' => 500000, 'qa_percent' => 10, 'urgency_rush_percent' => 25,
        'urgency_asap_percent' => 50, 'infrastructure_fee' => 100000, 'maintenance_percent' => 10,
        'extra_revision_percent' => 5, 'extra_revision_rounding' => 10000, 'deposit_percent' => 50,
    ];

    protected $fillable = ['user_id', 'pricing'];

    protected function casts(): array
    {
        return ['user_id' => 'integer', 'pricing' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
