<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

/**
 * Class CreateQuestGuidesTable
 */
class CreateQuestGuidesTable extends Migration
{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('guides_quests', function(Blueprint $table) {
			$table->increments('id');
			$table->string('name');
			$table->integer('author_id');
			$table->string('editors');
			$table->integer('difficulty');
			$table->integer('length');
			$table->integer('qp');
			$table->boolean('membership');
			$table->boolean('completed');
			$table->string('description');
			$table->mediumtext('quest_requirements');
			$table->mediumtext('skill_requirements');
			$table->mediumtext('items_required');
			$table->mediumtext('items_recommended');
			$table->mediumtext('rewards');
			$table->mediumtext('starting_point');
			$table->mediumtext('contents');
			$table->mediumtext('contents_parsed');
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
		Schema::drop('guides_quests');
	}
}