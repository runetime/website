<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
/**
 * Class CreateDatabaseMonstersTable
 */
class CreateDatabaseMonstersTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('database_monsters', function(Blueprint $table)
		{
			$table->increments('id');
			$table->integer('author_id');
			$table->mediumText('editors');
			$table->mediumText('examine');
			$table->mediumText('examine_parsed');
			$table->mediumText('stats');
			$table->mediumText('stats_parsed');
			$table->mediumText('location');
			$table->mediumText('location_parsed');
			$table->mediumText('drops');
			$table->mediumText('drops_parsed');
			$table->boolean('members');
			$table->mediumText('other_information');
			$table->mediumText('other_information_parsed');
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
		Schema::drop('database_monsters');
	}

}
