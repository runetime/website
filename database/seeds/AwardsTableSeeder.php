<?php

use Illuminate\Database\Seeder;

/**
 * Class AwardsTableSeeder
 */
class AwardsTableSeeder extends Seeder
{
    /**
     *
     */
    public function run()
    {
        DB::table('awards')->delete();
        DB::table('awards')->
            insert([
                [
                    'name'         => 'Competition Winner',
                    'name_trim'    => 'competition_winner',
                    'description'  => 'You won a RuneTime competition!',
                    'last_awarded' => -1,
                    'status'       => 1,
                ],
                [
                    'name'         => 'RuneTime Member of the Month',
                    'name_trim'    => 'runetime_member_of_the_month',
                    'description'  => 'Awarded to a member each month for outstanding community contribution!',
                    'last_awarded' => -1,
                    'status'       => 1,
                ],
                [
                    'name'         => 'Bond Winner',
                    'name_trim'    => 'bond_winner',
                    'description'  => 'Won a Bond from RuneTime!',
                    'last_awarded' => -1,
                    'status'       => 1,
                ],
                [
                    'name'         => 'Content - Quest Guide',
                    'name_trim'    => 'content__quest_guide',
                    'description'  => 'Submitted a Quest Guide to RuneTime!',
                    'last_awarded' => -1,
                    'status'       => 1,
                ],
                [
                    'name'         => 'Content - Location Guide',
                    'name_trim'    => 'content__location_guide',
                    'description'  => 'Submitted a RuneScape Location Guide to RuneTime!',
                    'last_awarded' => -1,
                    'status'       => 1,
                ],
                [
                    'name'         => 'Content - User Guide',
                    'name_trim'    => 'content__user_guide',
                    'description'  => 'Submitted a guide done so well they deserve an award!',
                    'last_awarded' => -1,
                    'status'       => 1,
                ],
                [
                    'name'         => 'Content - Coding',
                    'name_trim'    => 'content__coding',
                    'description'  => 'Awarded to members and staff who have contributed towards coding a feature in RuneTime',
                    'last_awarded' => -1,
                    'status'       => 1,
                ],
                [
                    'name'         => 'RuneTime Orginal Member',
                    'name_trim'    => 'runetime_original_member',
                    'description'  => 'This is awarded to the first 100 members who joined and supported RuneTime from the beginning!',
                    'last_awarded' => -1,
                    'status'       => 1,
                ],
                [
                    'name'         => 'DJ of the Month',
                    'name_trim'    => 'dj_of_the_month',
                    'description'  => 'Given to the DJ who aired the most hours in a given month.',
                    'last_awarded' => -1,
                    'status'       => 1,
                ],
                [
                    'name'         => 'Donator',
                    'name_trim'    => 'donator',
                    'description'  => 'This award is given to all members who have made a donation to the website! Thanks to everyone who has this award.',
                    'last_awarded' => -1,
                    'status'       => 1,
                ],
                [
                    'name'         => 'Refer A Friend',
                    'name_trim'    => 'refer_a_friend',
                    'description'  => 'Given to a member who gets his friends to join RuneTime!',
                    'last_awarded' => -1,
                    'status'       => 1,
                ],
                [
                    'name'         => 'Noble Award',
                    'name_trim'    => 'noble_award',
                    'description'  => 'Given to those who become a noble member!',
                    'last_awarded' => -1,
                    'status'       => 1,
                ],
            ]);
    }
}
