<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usergroups', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->json('permissions')->nullable();
            $table->timestamps();
        });

        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->unique();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('usergroup_id')->nullable()->after('email')->constrained('usergroups')->nullOnDelete();
        });

        Schema::create('project_owners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name')->unique();
            $table->string('country');
            $table->string('contact_number')->nullable();
            $table->timestamps();
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('owner_id')->constrained('project_owners')->cascadeOnDelete();
            $table->string('name')->unique();
            $table->string('url')->nullable();
            $table->string('referrer')->nullable();
            $table->decimal('commission_fee', 12, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('owner_id')->constrained('project_owners')->cascadeOnDelete();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->integer('amount');
            $table->string('currency')->default('IDR');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('owner_id')->constrained('project_owners')->cascadeOnDelete();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('currency')->default('IDR');
            $table->integer('amount')->default(0);
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();

            $table->unique(['project_id', 'type']);
        });

        Schema::create('service_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('owner_id')->constrained('project_owners')->cascadeOnDelete();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('users_usergroups_companies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('usergroup_id')->constrained('usergroups')->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->unique(['user_id', 'company_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users_usergroups_companies');
        Schema::dropIfExists('service_logs');
        Schema::dropIfExists('services');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('project_owners');

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('usergroup_id');
        });

        Schema::dropIfExists('companies');
        Schema::dropIfExists('usergroups');
    }
};
