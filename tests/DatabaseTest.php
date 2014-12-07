<?php
class DatabaseTest extends TestCase {

	/**
	 * A basic functional test example.
	 *
	 * @return void
	 */
	public function testDatabase()
	{
		shell_exec('mysql -u root -p -e "DROP DATABASE IF EXISTS runetime"');
		shell_exec('mysql -u root -p -e "CREATE DATABASE runetime"');
		Artisan::call('migrate');
		Artisan::call('db:seed');
	}
}