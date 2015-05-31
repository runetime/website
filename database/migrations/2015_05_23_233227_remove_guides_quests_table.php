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
        if (Schema::hasTable('guides_quests')) {
            Schema::dropIfExists('guides_quests');
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
