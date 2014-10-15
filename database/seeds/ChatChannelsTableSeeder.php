<?php
use Illuminate\Database\Seeder;
class ChatChannelsTableSeeder extends Seeder{
	/**
	 *
	 */
	public function run(){
		DB::table('chat_channels')->delete();
		DB::table('chat_channels')->
			insert([
				[
					'name'     =>'Radio',
					'name_trim'=>'radio',
					'messages' =>0,
				],
				[
					'name'     =>'Livestream',
					'name_trim'=>'livestream',
					'messages' =>0,
				],
			]);
	}
}