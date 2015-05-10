<?php
use Illuminate\Database\Seeder;

/**
 * Class ChatChannelsTableSeeder
 */
class ChatChannelsTableSeeder extends Seeder
{
    /**
     *
     */
    public function run()
    {
        DB::table('chat_channels')->delete();
        DB::table('chat_channels')->
            insert([
                [
                    'name'      => 'Radio',
                    'name_trim' => 'radio',
                    'messages'  => 0,
                ],
                [
                    'name'      => 'Livestream',
                    'name_trim' => 'livestream',
                    'messages'  => 0,
                ],
            ]);

        DB::table('chat_filters')->
        insert([
            [
                'text' => 'bastard',
            ],
            [
                'text' => 'bitch',
            ],
            [
                'text' => 'cunt',
            ],
            [
                'text' => 'fag',
            ],
            [
                'text' => 'faggot',
            ],
            [
                'text' => 'fuck',
            ],
            [
                'text' => 'fucka',
            ],
            [
                'text' => 'fucker',
            ],
            [
                'text' => 'fuckin',
            ],
            [
                'text' => 'fucking',
            ],
            [
                'text' => 'nigga',
            ],
            [
                'text' => 'nigger',
            ],
            [
                'text' => 'pussy',
            ],
            [
                'text' => 'pu$$y',
            ],
            [
                'text' => 'shit',
            ],
            [
                'text' => 'slag',
            ],
            [
                'text' => 'slut',
            ],
        ]);
    }
}
