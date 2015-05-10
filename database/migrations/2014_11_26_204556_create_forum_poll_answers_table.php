<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

/**
 * Class CreateForumPollAnswersTable
 */
class CreateForumPollAnswersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('forum_poll_answers', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('question_id');
            $table->mediumtext('contents');
            $table->integer('votes');
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
        Schema::drop('forum_poll_answers');
    }
}
