<?php namespace App\Console\Commands;
use App\RuneTime\Radio\History;
use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;
/**
 * Class RadioUpdate
 * @package App\Console\Commands
 */
class RadioUpdate extends Command {

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
	protected $description = 'Updates the song that the radio is currently playing.';

	/**
	 * Create a new command instance.
	 *
	 * @return void
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
		$this->line("Pulling data from Primcast servers");
		$url = 'http://widgets.primcast.com/SHOUTinfo/data.php?id=runetime.primcast.com%3A6582&songslist=1&ap64=wqs%24%24lkt117B4w2&timezone=GMT&color=FF0000';
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		$results = curl_exec($curl);
		curl_close($curl);
		$this->line("Pulled data from Primcast servers");
		$result = explode("\n", $results);
		$result = explode("</span> ", $result[0]);
		$songInfo = explode(" - ", $result[1]);
		$artist = $songInfo[0];
		$song = $songInfo[1];
		$song = str_replace("</li>", "", $song);
		$history = new History;
		$currentDJ = \Cache::get('radio.dj.current');
		if(empty($currentDJ))
			$currentDJ = -1;
		$this->line("Adding data to database");
		$history->saveNew($currentDJ, $artist, $song);
		$this->line("Updated radio to be playing " . $song . " by " . $artist);
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
