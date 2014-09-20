<?php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
class CreateNewsTable extends Migration{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up(){
		Schema::create('news',function(Blueprint $t){
			$t->increments('id');
			$t->integer('author_id');
			$t->string('title');
			$t->string('contents');
			$t->integer('status');
			$t->string('comments');
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
		Schema::drop('news');
	}
}