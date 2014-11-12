<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class DatabaseSeeder extends Seeder {

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
		$this->call('GuideInfoTableSeeder');
		$this->call('RolesTableSeeder');
		$this->call('BBCodeTableSeeder');
		$this->call('SubforumsTableSeeder');
		$this->call('RadioTimetablesTableSeeder');
	}

}
