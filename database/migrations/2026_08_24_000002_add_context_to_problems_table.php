<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('problems', function (Blueprint $table) {
            $table->string('entry_type')->default('problem')->after('idea_id');
            $table->string('status')->default('open')->after('entry_type');
            $table->foreignId('project_owner_id')->nullable()->after('status')->constrained()->nullOnDelete();
            $table->foreignId('project_id')->nullable()->after('project_owner_id')->constrained()->nullOnDelete();
            $table->string('customer_name')->nullable()->after('project_id');
            $table->index(['user_id', 'entry_type', 'status']);
        });

        DB::table('problems')
            ->whereNotNull('idea_id')
            ->update(['status' => 'solution_drafted']);
    }

    public function down(): void
    {
        Schema::table('problems', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'entry_type', 'status']);
            $table->dropConstrainedForeignId('project_id');
            $table->dropConstrainedForeignId('project_owner_id');
            $table->dropColumn(['entry_type', 'status', 'customer_name']);
        });
    }
};
