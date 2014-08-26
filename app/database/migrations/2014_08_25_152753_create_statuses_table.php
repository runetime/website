<?php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
class CreateStatusesTable extends Migration{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up(){
		Schema::create('statuses',function(Blueprint $table){
			$table->integer('id');
			$table->primary('id');
			$table->integer('author_id');
			$table->string('contents');
			$table->string('comment_amount');
			$table->string('published_at');
		});
	}
	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down(){
		Schema::table('statuses',function(Blueprint $table){
		});
	}
}