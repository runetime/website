<?php
use Illuminate\Database\Seeder;
class RadioTimetablesTableSeeder extends Seeder{
	public function run(){
		DB::table('radio_timetables')->delete();
		for($a = 2014; $a < 2016; $a++) {
			for($j = 1; $j < 366; $j++) {
				for($x = 0; $x < 23; $x++) {
					DB::table('radio_timetables')->
						insertGetId([
							'dj_id' => -1,
							'year'  => $a,
							'day'   => $j,
							'hour'  => $x,
						]);
				}
			}
		}
	}
}