<?php

use Illuminate\Database\Seeder;

/**
 * Class RolesTableSeeder
 */
class RolesTableSeeder extends Seeder
{
    /**
     *
     */
    public function run()
    {
        DB::table('roles')->delete();
        DB::table('roles')->
            insert([
                [
                    'name'       => 'Administrator',
                    'name_trim'  => 'administrator',
                    'class_name' => 'administrator',
                ],
                [
                    'name'       => 'Radio Team Leader',
                    'name_trim'  => 'radio_team_leader',
                    'class_name' => 'radio-team-leader',
                ],
                [
                    'name'       => 'Radio DJ',
                    'name_trim'  => 'radio_dj',
                    'class_name' => 'radio-dj',
                ],
                [
                    'name'       => 'Media Team Leader',
                    'name_trim'  => 'media_team_leader',
                    'class_name' => 'media-team-leader',
                ],
                [
                    'name'       => 'Media Team',
                    'name_trim'  => 'media_team',
                    'class_name' => 'media-team',
                ],
                [
                    'name'       => 'Web Developer Leader',
                    'name_trim'  => 'web_developer_leader',
                    'class_name' => 'web-developer-leader',
                ],
                [
                    'name'       => 'Web Developer',
                    'name_trim'  => 'web_developer',
                    'class_name' => 'web-developer',
                ],
                [
                    'name'       => 'Community Team Leader',
                    'name_trim'  => 'community_team_leader',
                    'class_name' => 'community-team-leader',
                ],
                [
                    'name'       => 'Community Team',
                    'name_trim'  => 'community_team',
                    'class_name' => 'community-team',
                ],
                [
                    'name'       => 'Events Team Leader',
                    'name_trim'  => 'events_team_leader',
                    'class_name' => 'events-team-leader',
                ],
                [
                    'name'       => 'Events Team',
                    'name_trim'  => 'events_team',
                    'class_name' => 'events-team',
                ],
                [
                    'name'       => 'Donator',
                    'name_trim'  => 'donator',
                    'class_name' => 'donator',
                ],
                [
                    'name'       => 'Retired Noble Staff',
                    'name_trim'  => 'retired_noble_staff',
                    'class_name' => 'retired-noble-staff',
                ],
                [
                    'name'       => 'Retired Staff',
                    'name_trim'  => 'retired_staff',
                    'class_name' => 'retired-staff',
                ],
                [
                    'name'       => 'Members',
                    'name_trim'  => 'members',
                    'class_name' => 'members',
                ],
            ]);
    }
}
