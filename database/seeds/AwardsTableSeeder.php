<?php
use Illuminate\Database\Seeder;
class AwardsTableSeeder extends Seeder{
	public function run(){
		DB::table('awards')->delete();
		DB::table('awards')->
			insert([
				[
					'name'        =>'Competition Winner',
					'name_trim'   =>'competition_winner',
					'description' =>'You won a RuneTime competition!',
					'given'       =>2,
					'last_awarded'=>1402859160
				],
				[
					'name'        =>'RuneTime Member of the Month',
					'name_trim'   =>'runetime_member_of_the_month',
					'description' =>'Awarded to a member each month for outstanding community contribution!',
					'given'       =>4,
					'last_awarded'=>1407111960
				],
				[
					'name'        =>'Bond Winner',
					'name_trim'   =>'bond_winner',
					'description' =>'Won a Bond from RuneTime!',
					'given'       =>10,
					'last_awarded'=>1408602240
				],
				[
					'name'        =>'Content - Quest Guide',
					'name_trim'   =>'content__quest_guide',
					'description' =>'Submitted a Quest Guide to RuneTime!',
					'given'       =>6,
					'last_awarded'=>1400298060
				],
				[
					'name'        =>'Content - Location Guide',
					'name_trim'   =>'content__location_guide',
					'description' =>'Submitted a RuneScape Location Guide to RuneTime!',
					'given'       =>1,
					'last_awarded'=>1395456720
				],
				[
					'name'        =>'Content - User Guide',
					'name_trim'   =>'content__user_guide',
					'description' =>'Submitted a guide done so well they deserve an award!',
					'given'       =>4,
					'last_awarded'=>1403888580
				],
				[
					'name'        =>'Content - Coding',
					'name_trim'   =>'content__coding',
					'description' =>'Awarded to members and staff who have contributed towards coding a feature in RuneTime',
					'given'       =>2,
					'last_awarded'=>1404782520
				],
				[
					'name'        =>'RuneTime Orginal Member',
					'name_trim'   =>'runetime_original_member',
					'description' =>'This is awarded to the first 100 members who joined and supported RuneTime from the beginning!',
					'given'       =>100,
					'last_awarded'=>1405806960
				],
				[
					'name'        =>'DJ of the Month',
					'name_trim'   =>'dj_of_the_month',
					'description' =>'Given to the DJ who aired the most hours in a given month.',
					'given'       =>4,
					'last_awarded'=>1404036780
				],
				[
					'name'        =>'Donator',
					'name_trim'   =>'donator',
					'description' =>'This award is given to all members who have made a donation to the website! Thanks to everyone who has this award.',
					'given'       =>7,
					'last_awarded'=>1405630200
				],
				[
					'name'        =>'Refer A Friend',
					'name_trim'   =>'refer_a_friend',
					'description' =>'Given to a member who gets his friends to join RuneTime!',
					'given'       =>6,
					'last_awarded'=>1404491460
				],
				[
					'name'        =>'Noble Award',
					'name_trim'   =>'noble_award',
					'description' =>'Given to those who become a noble member!',
					'given'       =>3,
					'last_awarded'=>1407235380
				],
			]);
	}
}