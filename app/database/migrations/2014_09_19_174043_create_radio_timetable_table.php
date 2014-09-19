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
		Schema::create('radio_timetable', function(Blueprint $table)
		{
			$table->increments('id');
			$table->integer('year');
			$table->integer('month');
			$table->integer('day');
			$table->integer('hour');
			$table->integer('dj_id');
			$table->timestamps();
			$table->softDeletes();
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
