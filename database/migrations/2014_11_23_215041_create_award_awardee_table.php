<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

/**
 * Class CreateAwardAwardeeTable
 */
class CreateAwardAwardeeTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('award_awardee', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('award_id');
            $table->integer('awardee_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('award_awardee');
    }
}
