<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRadioTimetableTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('radio_timetable', function(Blueprint $t)
		{
			$t->increments('id');
			$t->integer('year');
			$t->integer('month');
			$t->integer('day');
			$t->integer('hour');
			$t->integer('dj_id');
			$t->timestamps();
			$t->softDeletes();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('radio_timetable');
	}

}
