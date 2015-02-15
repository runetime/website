<?php
namespace App\Console\Commands\Radio;

use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;

/**
 * Class Timetable
 * @package App\Console\Commands\Radio
 */
class Timetable extends Command
{
	/**
	 * The console command name.
	 *
	 * @var string
	 */
	protected $name = 'radio:timetable';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Clears the current timetable';

	/**
	 * Create a new console command instance.
	 */
	public function __construct()
	{
		parent::__construct();
	}

	/**
	 * Execute the console command.
	 *
	 * @return mixed
	 */
	public function fire()
	{
		$this->info('test');
	}

	/**
	 * Get the console command arguments.
	 *
	 * @return array
	 */
	protected function getArguments()
	{
		return [
			['force', InputArgument::OPTIONAL, 'Forces a reset, otherwise starts every monday'],
		];
	}

	/**
	 * Get the console command options.
	 *
	 * @return array
	 */
	protected function getOptions()
	{
		return [
			['example', null, InputOption::VALUE_OPTIONAL, 'An example option.', null],
		];
	}
}