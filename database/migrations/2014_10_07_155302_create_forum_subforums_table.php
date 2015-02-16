<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

/**
 * Class CreateForumSubforumsTable
 */
class CreateForumSubforumsTable extends Migration
{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('forum_subforums', function(Blueprint $table) {
			$table->increments('id');
			$table->string('name');
			$table->mediumtext('description');
			$table->mediumtext('roles');
			$table->boolean('posts_enabled');
			$table->boolean('posts_active');
			$table->integer('thread_count');
			$table->integer('post_count');
			$table->integer('last_post');
			$table->integer('position');
			$table->integer('parent');
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