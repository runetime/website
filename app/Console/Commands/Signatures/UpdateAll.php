<?php
namespace App\Console\Commands\Signatures;

use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

/**
 * Class UpdateAll
 */
final class UpdateAll extends Command
{
    /**
     * The console command name.
     *
     * @var string
     */
    protected $name = 'signatures:update';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Updates all of the signatures';

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
        $paths = \File::allFiles(\base_path() . '/public/img/signatures/generated/');
        foreach ($paths as $path) {
            $file = explode('/generated/', $path)[1];
            if ($file === '.gitignore') {
                continue;
            }

            $this->info($file);

            if (file_exists($path)) {
                unlink($path);
            }

            $slug = str_replace('.png', '', $file);

            $signature = \App::make('App\Http\Controllers\SignatureController')->
                createSignature($slug);
            $this->line($signature);
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
