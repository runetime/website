<?php

use Illuminate\Database\Migrations\Migration;

/**
 * Class RemoveGuideInfoTable
 */
class RemoveGuideInfoTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('guide_info')) {
            Schema::drop('guide_info');
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
    }
}
