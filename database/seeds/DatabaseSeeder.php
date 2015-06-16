<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Model::unguard();

        $this->call('AwardsTableSeeder');
        $this->call('CalculatorsTableSeeder');
        $this->call('ChatChannelsTableSeeder');
        $this->call('ForumRanksTableSeeder');
        $this->call('RadioTimetablesTableSeeder');
        $this->call('RolesTableSeeder');
        $this->call('SubforumsTableSeeder');

        Model::reguard();
    }
}
