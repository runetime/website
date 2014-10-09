<?php
use Illuminate\Database\Seeder;
class CalculatorsTableSeeder extends Seeder{
	public function run(){
		DB::table('calculators')->delete();
		DB::table('calculators')->
			insert([
				[
					'name'     =>'Firemaking',
					'name_trim'=>'firemaking',
					'items'    =>json_encode([
						'Normal',
						'Achey',
						'Oak',
						'Willow',
						'Teak',
						'Arctic Pine',
						'Maple',
						'Mahogany',
						'Eucalyptus',
						'Yew',
						'Magic',
						'Blisterwood',
						'Cursed Magic',
						'Curly Root',
						'Elder'
					]),
					'levels_required'=>json_encode([
						1,
						1,
						15,
						30,
						35,
						42,
						45,
						50,
						58,
						60,
						75,
						76,
						82,
						83,
						90,
					]),
					'xp'=>json_encode([
						40,
						40,
						60,
						90,
						105,
						125,
						141,
						157.5,
						193.5,
						202.5,
						303.8,
						303.8,
						303.8,
						378.7,
						450
					]),
				],
			]);
	}
}