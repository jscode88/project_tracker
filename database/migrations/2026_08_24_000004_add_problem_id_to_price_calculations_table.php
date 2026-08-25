<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('price_calculations', function (Blueprint $table) {
            $table->foreignId('problem_id')
                ->nullable()
                ->after('project_id')
                ->constrained('problems')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('price_calculations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('problem_id');
        });
    }
};
