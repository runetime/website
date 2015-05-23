<?php

use Illuminate\Database\Migrations\Migration;

/**
 * Class RemoveGuidesQuestsTable
 */
class RemoveGuidesQuestsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::drop('guides_quests');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
    }
}
