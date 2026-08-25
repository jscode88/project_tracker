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
            $table->string('contact_person')->nullable()->after('customer_name');
            $table->string('contact_method')->nullable()->after('contact_person');
            $table->string('enquiry_source')->nullable()->after('contact_method');
            $table->decimal('expected_budget', 15, 2)->nullable()->after('enquiry_source');
            $table->string('expected_budget_currency', 3)->nullable()->after('expected_budget');
            $table->date('desired_delivery_date')->nullable()->after('expected_budget_currency');
            $table->date('follow_up_date')->nullable()->after('desired_delivery_date');
            $table->string('next_action')->nullable()->after('follow_up_date');
            $table->index(['user_id', 'follow_up_date']);
        });

        DB::table('problems')->where('entry_type', 'enquiry')->where('status', 'open')->update(['status' => 'new_enquiry']);
        DB::table('problems')->where('entry_type', 'enquiry')->where('status', 'solution_drafted')->update(['status' => 'proposal_drafted']);
        DB::table('problems')->where('entry_type', 'enquiry')->where('status', 'resolved')->update(['status' => 'won']);
        DB::table('problems')->where('entry_type', 'enquiry')->where('status', 'closed')->update(['status' => 'lost']);
    }

    public function down(): void
    {
        DB::table('problems')->where('entry_type', 'enquiry')->where('status', 'new_enquiry')->update(['status' => 'open']);
        DB::table('problems')->where('entry_type', 'enquiry')->whereIn('status', ['discovery', 'proposal_drafted', 'proposal_sent'])->update(['status' => 'solution_drafted']);
        DB::table('problems')->where('entry_type', 'enquiry')->where('status', 'won')->update(['status' => 'resolved']);
        DB::table('problems')->where('entry_type', 'enquiry')->where('status', 'lost')->update(['status' => 'closed']);

        Schema::table('problems', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'follow_up_date']);
            $table->dropColumn([
                'contact_person',
                'contact_method',
                'enquiry_source',
                'expected_budget',
                'expected_budget_currency',
                'desired_delivery_date',
                'follow_up_date',
                'next_action',
            ]);
        });
    }
};
