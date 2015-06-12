<?php
namespace App\Console\Commands\Radio;

use App\RuneTime\Radio\HistoryRepository;
use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

/**
 * Class Artist
 */
class Artist extends Command
{
    /**
     * The console command name.
     *
     * @var string
     */
    protected $name = 'radio:artist';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Returns the artist of the current song playing';
    /**
     * @var HistoryRepository
     */
    private $history;

    /**
     * Create a new command instance.
     *
     * @param HistoryRepository $history
     *
     * @return \App\Console\Commands\Radio\Artist
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
        $this->info(\Cache::get('radio.artisan.lastUpdated'));

        $this->info(time());

        $this->info(time() - \Cache::get('radio.artisan.lastUpdated'));

        $lastRan = time() - \Cache::get('radio.artisan.lastRan');
        $this->info('Last ran: ' . $lastRan);

        $this->info($this->history->getCurrent()->artist);
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
