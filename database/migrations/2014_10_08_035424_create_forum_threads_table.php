<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateForumThreadsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('forum_threads', function(Blueprint $table)
		{
			$table->increments('id');
			$table->integer('author_id');
			$table->string('title');
			$table->integer('views');
			$table->integer('posts');
			$table->integer('last_post');
			$table->integer('poll');
			$table->integer('status');
			$table->mediumtext('tags');
			$table->integer('subforum');
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
		Schema::drop('forum_threads');
	}

}
