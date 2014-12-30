<?php namespace App\Console\Commands\Radio;

use App\RuneTime\Accounts\UserRepository;
use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;
/**
 * Class DJ
 * @package App\Console\Commands\Radio
 */
class DJ extends Command {

	/**
	 * The console command name.
	 *
	 * @var string
	 */
	protected $name = 'radio:dj';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Returns the info of the DJ currently DJing';
	/**
	 * @var UserRepository
	 */
	private $users;

	/**
	 * Create a new command instance.
	 *
	 * @param UserRepository $users
	 *
	 * @return \App\Console\Commands\Radio\DJ
	 */
	public function __construct(UserRepository $users)
	{
		parent::__construct();
		$this->users = $users;
	}

	/**
	 * Execute the console command.
	 *
	 * @return mixed
	 */
	public function fire()
	{
		$currentDJ = \Cache::get('radio.dj.current');
		if(empty($currentDJ) || $currentDJ <= 0) {
			$this->info("Auto DJ");
		} else {
			$this->info($this->users->getById($currentDJ)->display_name);
		}
	}

	/**
	 * Get the console command arguments.
	 *
	 * @return array
	 */
	protected function getArguments()
	{
		return [
			['example', InputArgument::OPTIONAL, 'An example argument.'],
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
