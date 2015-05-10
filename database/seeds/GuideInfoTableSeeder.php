<?php

use Illuminate\Database\Seeder;

/**
 * Class GuideInfoTableSeeder
 */
class GuideInfoTableSeeder extends Seeder
{
    /**
     *
     */
    public function run()
    {
        DB::table('guide_info')->delete();
        DB::table('guide_info')->
            insert([
                [
                    'type' => 'difficulty',
                    'name' => 'Novice',
                ],
                [
                    'type' => 'difficulty',
                    'name' => 'Intermediate',
                ],
                [
                    'type' => 'difficulty',
                    'name' => 'Experienced',
                ],
                [
                    'type' => 'difficulty',
                    'name' => 'Master',
                ],
                [
                    'type' => 'difficulty',
                    'name' => 'Grandmaster',
                ],
                [
                    'type' => 'length',
                    'name' => 'Short',
                ],
                [
                    'type' => 'length',
                    'name' => 'Medium',
                ],
                [
                    'type' => 'length',
                    'name' => 'Long',
                ],
                [
                    'type' => 'length',
                    'name' => 'Very Long',
                ],
                [
                    'type' => 'membership',
                    'name' => 'Free',
                ],
                [
                    'type' => 'membership',
                    'name' => 'Members',
                ],
            ]);
    }
}
