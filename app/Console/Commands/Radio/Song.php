<?php
namespace App\Console\Commands\Radio;

use App\RuneTime\Radio\HistoryRepository;
use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

/**
 * Class Song
 */
final class Song extends Command
{
    /**
     * The console command name.
     *
     * @var string
     */
    protected $name = 'radio:song';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Returns the name of the song currently playing';
    /**
     * @var HistoryRepository
     */
    private $history;

    /**
     * Create a new command instance.
     *
     * @param HistoryRepository $history
     *
     * @return \App\Console\Commands\Radio\Song
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
    public function fire()
    {
        $currentSong = $this->history->getCurrent()->song;

        $this->info($currentSong);
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
