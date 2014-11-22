<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateForumPostsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('forum_posts', function(Blueprint $table)
		{
			$table->increments('id');
			$table->integer('author_id');
			$table->integer('rep');
			$table->integer('status');
			$table->integer('ip');
			$table->mediumtext('contents');
			$table->mediumtext('contents_parsed');
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
		Schema::drop('forum_posts');
	}

}
