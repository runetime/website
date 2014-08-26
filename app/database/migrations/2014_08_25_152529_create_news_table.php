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
		Schema::create('news',function(Blueprint $table){
			$table->increments('id');
			$table->integer('author_id');
			$table->string('title');
			$table->string('contents');
			$table->integer('status');
			$table->string('tags');
			$table->string('published_at');
		});
	}
	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down(){
		Schema::table('news', function(Blueprint $table){
		});
	}
}