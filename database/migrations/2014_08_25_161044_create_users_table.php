<?php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
class CreateUsersTable extends Migration{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up(){
		Schema::create('users',function(Blueprint $t){
			$t->increments('id');
			$t->string('display_name');
			$t->string('email');
			$t->string('password');
			$t->string('title');
			$t->mediumtext('about');
			$t->mediumtext('about_parsed');
			$t->mediumtext('signature');
			$t->mediumtext('signature_parsed');
			$t->integer('posts_active');
			$t->integer('posts_total');
			$t->integer('profile_views');
			$t->integer('birthday');
			$t->integer('gender');
			$t->integer('referred_by');
			$t->mediumtext('awards');
			$t->string('social_twitter');
			$t->string('social_facebook');
			$t->string('social_youtube');
			$t->string('social_website');
			$t->string('social_skype');
			$t->string('runescape_version');
			$t->string('runescape_rsn');
			$t->string('runescape_clan');
			$t->string('runescape_allegiance');
			$t->rememberToken();
			$t->timestamps();
			$t->softDeletes();
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