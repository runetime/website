<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

/**
 * Class CreateQuestGuidesTable
 */
class CreateQuestGuidesTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('guides_quests', function(Blueprint $t)
		{
			$t->increments('id');
			$t->string('name');
			$t->integer('author_id');
			$t->string('editors');
			$t->integer('difficulty');
			$t->integer('length');
			$t->integer('qp');
			$t->boolean('membership');
			$t->boolean('completed');
			$t->string('description');
			$t->mediumtext('quest_requirements');
			$t->mediumtext('skill_requirements');
			$t->mediumtext('items_required');
			$t->mediumtext('items_recommended');
			$t->mediumtext('rewards');
			$t->mediumtext('starting_point');
			$t->mediumtext('contents');
			$t->mediumtext('contents_parsed');
			$t->timestamps();
			$t->softDeletes();
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
