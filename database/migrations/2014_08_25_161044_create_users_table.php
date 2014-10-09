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
			$t->integer('referred_by');
			$t->string('about');
			$t->string('signature');
			$t->integer('posts_active');
			$t->integer('posts_total');
			$t->integer('profile_views');
			$t->integer('birthday');
			$t->integer('gender');
			$t->mediumtext('awards');
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