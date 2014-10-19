<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateForumPollsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('forum_polls', function(Blueprint $table)
		{
			$table->increments('id');
			$table->integer('thread_id');
			$table->mediumtext('questions');
			$table->mediumtext('answers');
			$table->mediumtext('votes');
			$table->mediumtext('voters');
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
		Schema::drop('forum_polls');
	}

}
