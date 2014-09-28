<?php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
class CreateCalculatorsTable extends Migration{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up(){
		Schema::create('calculators', function(Blueprint $table){
			$table->increments('id');
			$table->string('name');
			$table->string('name_trim');
			$table->mediumtext('items');
			$table->mediumtext('levels_required');
			$table->mediumtext('xp');
			$table->timestamps();
			$table->softDeletes();
		});
	}
	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down(){
		Schema::drop('calculators');
	}
}