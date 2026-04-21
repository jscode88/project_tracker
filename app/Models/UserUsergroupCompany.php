<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserUsergroupCompany extends Model
{
    use HasFactory;

    protected $table = 'users_usergroups_companies';

    public $timestamps = false;

    protected $fillable = ['user_id', 'usergroup_id', 'company_id'];
}
