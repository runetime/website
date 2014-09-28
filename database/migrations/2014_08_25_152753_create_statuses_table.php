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
		Schema::create('statuses',function(Blueprint $t){
			$t->integer('id');
			$t->primary('id');
			$t->integer('author_id');
			$t->string('contents');
			$t->string('comment_amount');
			$t->integer('status');
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
		Schema::drop('statuses');
	}
}