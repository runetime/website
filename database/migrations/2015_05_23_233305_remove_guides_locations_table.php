<?php

use Illuminate\Database\Migrations\Migration;

/**
 * Class RemoveGuidesLocationsTable
 */
class RemoveGuidesLocationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('guides_locations')) {
            Schema::drop('guides_locations');
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
