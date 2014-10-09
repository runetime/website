<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateBbcodeTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('bbcode', function(Blueprint $table)
		{
			$table->increments('id');
			$table->string('name');
			$table->string('example');
			$table->string('parsed');
			$table->mediumtext('parse_from');
			$table->mediumtext('parse_to');
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('bbcode');
	}

}
