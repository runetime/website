<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up() {
		Schema::create('users', function(Blueprint $table) {
			$table->increments('id');
			$table->mediumtext('about');
			$table->mediumtext('about_parsed');
			$table->integer('birthday_day');
			$table->integer('birthday_month');
			$table->integer('birthday_year');
			$table->string('display_name');
			$table->boolean('dst');
			$table->string('email');
			$table->integer('gender');
			$table->integer('last_active');
			$table->string('password');
			$table->integer('profile_views');
			$table->integer('posts_active');
			$table->integer('posts_total');
			$table->string('social_facebook');
			$table->string('social_skype');
			$table->string('social_twitter');
			$table->string('social_website');
			$table->string('social_youtube');
			$table->integer('rank_id');
			$table->integer('referred_by');
			$table->integer('reputation');
			$table->string('runescape_allegiance');
			$table->string('runescape_clan');
			$table->string('runescape_rsn');
			$table->string('runescape_version');
			$table->mediumtext('signature');
			$table->mediumtext('signature_parsed');
			$table->float('timezone');
			$table->string('title');
			$table->rememberToken();
			$table->timestamps();
			$table->softDeletes();
		});
	}
	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down(){
		Schema::drop('users');
	}
}