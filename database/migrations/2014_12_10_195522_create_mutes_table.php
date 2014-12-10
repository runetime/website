<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMutesTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('mutes', function(Blueprint $table)
		{
			$table->increments('id');
			$table->integer('author_id');
			$table->integer('user_id');
			$table->string('reason');
			$table->string('reason_parsed');
			$table->integer('time_start');
			$table->integer('time_end');
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
		Schema::drop('mutes');
	}

}
