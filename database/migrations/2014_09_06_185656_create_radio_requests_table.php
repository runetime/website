<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

/**
 * Class CreateRadioRequestsTable
 */
class CreateRadioRequestsTable extends Migration
{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('radio_requests', function(Blueprint $table) {
			$table->increments('id');
			$table->integer('author_id');
			$table->string('song_artist');
			$table->string('song_name');
			$table->string('ip_address');
			$table->integer('status');
			$table->timestamps();
			$table->softDeletes();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('radio_requests');
	}
}