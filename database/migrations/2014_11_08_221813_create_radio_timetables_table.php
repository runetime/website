<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

/**
 * Class CreateRadioTimetablesTable
 */
class CreateRadioTimetablesTable extends Migration
{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('radio_timetables', function(Blueprint $table) {
			$table->increments('id');
			$table->integer('dj_id');
			$table->integer('year');
			$table->integer('day');
			$table->integer('hour');
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('radio_timetables');
	}
}