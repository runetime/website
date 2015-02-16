<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

/**
 * Class CreateForumPollVotesTable
 */
class CreateForumPollVotesTable extends Migration
{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('forum_poll_votes', function(Blueprint $table) {
			$table->increments('id');
			$table->integer('answer_id');
			$table->integer('author_id');
			$table->integer('poll_id');
			$table->integer('question_id');
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
		Schema::drop('forum_poll_votes');
	}
}