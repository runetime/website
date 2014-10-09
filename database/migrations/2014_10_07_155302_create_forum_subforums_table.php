<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateForumSubforumsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('forum_subforums', function(Blueprint $table)
		{
			$table->increments('id');
			$table->string('name');
			$table->mediumtext('description');
			$table->integer('threads');
			$table->integer('posts');
			$table->integer('last_post');
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
		Schema::drop('forum_subforums');
	}

}
