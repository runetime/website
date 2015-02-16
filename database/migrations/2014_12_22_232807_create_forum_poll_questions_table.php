<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

/**
 * Class CreateForumPollQuestionsTable
 */
class CreateForumPollQuestionsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('forum_poll_questions', function(Blueprint $table)
		{
			$table->increments('id');
			$table->integer('poll_id');
			$table->string('contents');
			$table->integer('votes');
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
		Schema::drop('forum_poll_questions');
	}

}
