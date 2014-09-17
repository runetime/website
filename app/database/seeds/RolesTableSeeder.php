<?php
class RolesTableSeeder extends Seeder{
	public function run(){
		DB::table('roles')->delete();
		DB::table('roles')->
			insert([
				[
					'name'      =>'Administrator',
					'name_trim' =>'administrator',
					'class'     =>'administrator'
				],
				[
					'name'      =>'Community Team Leader',
					'name_trim' =>'community_team_leader',
					'class'     =>'community-team-leader'
				],
				[
					'name'      =>'Community Team',
					'name_trim' =>'community_team',
					'class'     =>'community-team'
				],
				[
					'name'      =>'Content Team',
					'name_trim' =>'content_team',
					'class'     =>'content-team'
				],
				[
					'name'      =>'Web Developer',
					'name_trim' =>'web_developer',
					'class'     =>'web-developer'
				],
				[
					'name'      =>'Radio Team Leader',
					'name_trim' =>'radio_team_leader',
					'class'     =>'radio-team-leader'
				],
				[
					'name'      =>'Radio DJ',
					'name_trim' =>'radio_dj',
					'class'     =>'radio-dj'
				],
				[
					'name'      =>'Donator',
					'name_trim' =>'donator',
					'class'     =>'donator'
				],
				[
					'name'      =>'Noble Member',
					'name_trim' =>'noble_member',
					'class'     =>'noble-member'
				],
				[
					'name'      =>'Retired Noble Staff',
					'name_trim' =>'retired_noble_staff',
					'class'     =>'retired-noble-staff'
				],
				[
					'name'      =>'Retired Staff',
					'name_trim' =>'retired_staff',
					'class'     =>'retired-staff'
				],
				[
					'name'      =>'Topaz Member',
					'name_trim' =>'topaz_member',
					'class'     =>'topaz-member'
				],
				[
					'name'      =>'Jade Member',
					'name_trim' =>'jade_member',
					'class'     =>'jade-member'
				],
				[
					'name'      =>'Members',
					'name_trim' =>'members',
					'class'     =>'members'
				],
			]);
	}
}