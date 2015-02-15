<?php namespace App\Console\Commands\Radio;
use App\RuneTime\Radio\History;
use App\RuneTime\Radio\HistoryRepository;
use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;
/**
 * Class RadioUpdate
 * @package App\Console\Commands
 */
class Update extends Command
{
	/**
	 * The console command name.
	 *
	 * @var string
	 */
	protected $name = 'radio:update';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Updates the song that the radio is currently playing';
	/**
	 * @var HistoryRepository
	 */
	private $history;

	/**
	 * Create a new console command instance.
	 *
	 * @param HistoryRepository $history
	 */
	public function __construct(HistoryRepository $history)
	{
		parent::__construct();
		$this->history = $history;
	}

	/**
	 * Execute the console command.
	 *
	 * @return mixed
	 */
	public function fire() {
		if(getenv('APP_ENV') === 'local') {
			$this->info('Local: not running');
			return;
		}

		\Cache::forever('radio.artisan.lastRan', time());
		$lastUpdated = \Cache::get('radio.artisan.lastUpdated');
		if(time() - $lastUpdated >= 240) {
			$this->info("Pulling data from Primcast servers");

			$path = 'runetime.primcast.com';
			$port = 6582;
			$results = $this->radioInfo($path, $port);
			$song = explode(" - ", $results[6]);
			$artist = $song[0];
			$name = $song[1];

			$this->info("Pulled data from Primcast servers");

			$currentDJ = \Cache::get('radio.dj.current');
			if(empty($currentDJ)) {
				$currentDJ = -1;
			}

			$currentHistory = $this->history->getCurrent();
			if(empty($currentHistory) || ($currentHistory->song != $name && $currentHistory->artist != $artist)) {
				with(new History)->saveNew($currentDJ, $artist, $name);
				\Cache::forever('radio.artisan.lastUpdated', time());
				$this->info("Updated radio to be playing " . $name . " by " . $artist);
			}
		}
	}

	/**
	 * @param $ip
	 * @param $port
	 *
	 * @return array|int
	 */
	private function radioInfo($ip, $port) {
		ini_set("allow_url_fopen", "On");
		$sh = fsockopen($ip, $port, $errno, $errstr, 30);
		if($sh) {
			fputs($sh, "GET /7.html HTTP/1.0\r\nUser-Agent: SHOUTcast Song Status (Mozilla Compatible)\r\n\r\n");
			$results = "";
			while(!feof($sh)) {
				$results .= fgets($sh, 1000);
			}

			fclose($sh);
			$results = strstr($results, "<body>");
			$results = str_replace("</body></html>", "", $results);
			$results = str_replace("<body>", "", $results);
			return explode(",", $results);
		}

		return -1;
	}

	/**
	 * Get the console command arguments.
	 *
	 * @return array
	 */
	protected function getArguments()
	{
		return [
			['force', InputArgument::OPTIONAL, 'Forces a reset, otherwise starts resetting in 3 minutes'],
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