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
			$table->string('username');
			$table->string('display_name');
			$table->string('email');
			$table->string('title');
			$table->integer('referred_by');
			$table->string('about');
			$table->string('signature');
			$table->integer('posts_active');
			$table->integer('posts_total');
			$table->integer('profile_views');
			$table->integer('birthday');
			$table->integer('gender');
			$table->rememberToken();
			$table->timestamps();
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