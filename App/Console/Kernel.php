<?php namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

/**
 * Class Kernel
 * @package App\Console
 */
class Kernel extends ConsoleKernel
{
	/**
	 * The Artisan commands provided by your application.
	 *
	 * @var array
	 */
	protected $commands = [
		'App\Console\Commands\InspireCommand',
		'App\Console\Commands\Radio\Artist',
		'App\Console\Commands\Radio\DJ',
		'App\Console\Commands\Radio\Song',
		'App\Console\Commands\Radio\Timetable',
		'App\Console\Commands\Radio\Update',
		'App\Console\Commands\Signatures\UpdateAll',
	];

	/**
	 * Define the application's command schedule.
	 *
	 * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
	 *
	 * @return void
	 */
	protected function schedule(Schedule $schedule)
	{
		$schedule->command('inspire')->
			hourly();
	}
}