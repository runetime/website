<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

/**
 * Class CreateDatabaseItemsTable
 */
class CreateDatabaseItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('database_items', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('author_id');
            $table->mediumText('editors');
            $table->string('name');
            $table->mediumText('examine');
            $table->mediumText('examine_parsed');
            $table->boolean('membership');
            $table->boolean('tradable');
            $table->boolean('quest_item');
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
        Schema::drop('database_items');
    }
}
