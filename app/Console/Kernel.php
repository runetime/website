<?php namespace App\Console;

use Exception;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel {

	/**
	 * The Artisan commands provided by your application.
	 *
	 * @var array
	 */
	protected $commands = [
		'App\Console\Commands\InspireCommand',
		'App\Console\Commands\Radio\Update',
		'App\Console\Commands\Radio\Song',
		'App\Console\Commands\Radio\Artist',
		'App\Console\Commands\Radio\DJ',
	];

	/**
	 * Run the console application.
	 *
	 * @param  \Symfony\Component\Console\Input\InputInterface  $input
	 * @param  \Symfony\Component\Console\Output\OutputInterface  $output
	 * @return int
	 */
	public function handle($input, $output = null)
	{
		try
		{
			return parent::handle($input, $output);
		}
		catch (Exception $e)
		{
			$this->reportException($e);

			$this->renderException($output, $e);

			return 1;
		}
	}

}
