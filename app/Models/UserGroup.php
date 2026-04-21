<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserGroup extends Model
{
    use HasFactory;

    protected $table = 'usergroups';

    protected $fillable = ['name', 'permissions'];

    protected function casts(): array
    {
        return ['permissions' => 'array'];
    }
}
