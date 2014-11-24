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
class Update extends Command {

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
	public function __construct(HistoryRepository $history
	)
	{
		parent::__construct();
		$this->history = $history;
	}

	/**
	 * Execute the console command.
	 *
	 * @return mixed
	 */
	public function fire()
	{
		\Cache::forever('radio.artisan.lastRan', time());
		$lastUpdated = \Cache::get('radio.artisan.lastUpdated');
		if(time() - $lastUpdated >= 240) {
			$this->info("Pulling data from Primcast servers");
			$results = \String::CURL('http://widgets.primcast.com/SHOUTinfo/data.php?id=runetime.primcast.com%3A6582&songslist=1&ap64=wqs%24%24lkt117B4w2&timezone=GMT&color=FF0000');
			$this->info("Pulled data from Primcast servers");
			$result = explode("\n", $results);
			$result = explode("</span> ", $result[0]);
			$songInfo = explode(" - ", $result[1]);
			$artist = $songInfo[0];
			$song = str_replace("</li>", "", $songInfo[1]);
			$history = new History;
			$currentDJ = \Cache::get('radio.dj.current');
			if(empty($currentDJ))
				$currentDJ = -1;
			$currentHistory = $this->history->getCurrent();
			if(empty($currentHistory) || ($currentHistory->song != $song && $currentHistory->artist != $artist)) {
				$history->saveNew($currentDJ, $artist, $song);
				\Cache::forever('radio.artisan.lastUpdated', time());
				$this->info("Updated radio to be playing " . $song . " by " . $artist);
			}
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
