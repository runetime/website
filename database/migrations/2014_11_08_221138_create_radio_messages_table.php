<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

/**
 * Class CreateRadioMessagesTable
 */
class CreateRadioMessagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('radio_messages', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('author_id');
            $table->string('contents');
            $table->string('contents_parsed');
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
        Schema::drop('radio_messages');
    }
}
