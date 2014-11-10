<?php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
/**
 * Class CreateRadioRequestsTable
 */
class CreateRadioRequestsTable extends Migration{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up(){
		Schema::create('radio_requests',function(Blueprint $t){
			$t->increments('id');
			$t->integer('author_id');
			$t->string('song_artist');
			$t->string('song_name');
			$t->string('ip_address');
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
		Schema::drop('radio_requests');
	}
}