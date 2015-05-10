<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

/**
 * Class CreateGuidesLocationsTable
 */
class CreateGuidesLocationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('guides_locations', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->integer('author_id');
            $table->mediumText('editors');
            $table->mediumText('contents');
            $table->mediumText('contents_parsed');
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
        Schema::drop('guides_locations');
    }
}
