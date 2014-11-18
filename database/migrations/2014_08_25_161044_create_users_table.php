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
		Schema::create('users',function(Blueprint $table){
			$table->increments('id');
			$table->string('display_name');
			$table->string('email');
			$table->string('password');
			$table->string('title');
			$table->mediumtext('about');
			$table->mediumtext('about_parsed');
			$table->mediumtext('signature');
			$table->mediumtext('signature_parsed');
			$table->integer('posts_active');
			$table->integer('posts_total');
			$table->integer('profile_views');
			$table->integer('birthday');
			$table->integer('gender');
			$table->integer('referred_by');
			$table->float('timezone');
			$table->boolean('dst');
			$table->integer('reputation');
			$table->integer('rank_id');
			$table->string('social_twitter');
			$table->string('social_facebook');
			$table->string('social_youtube');
			$table->string('social_website');
			$table->string('social_skype');
			$table->string('runescape_version');
			$table->string('runescape_rsn');
			$table->string('runescape_clan');
			$table->string('runescape_allegiance');
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