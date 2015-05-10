<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

/**
 * Class CreateForumReportsTable
 */
class CreateForumReportsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('forum_reports', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('author_id');
            $table->integer('reported_id');
            $table->integer('type_id');
            $table->integer('status_id');
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
        Schema::drop('forum_reports');
    }
}
