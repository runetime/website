<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddSessionToRadioRequests extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('radio_requests', function(Blueprint $table)
		{
			$table->integer('session');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('radio_requests', function(Blueprint $table)
		{
			$table->dropColumn('session');
		});
	}

}
