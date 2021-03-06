<?php
namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

/**
 * Class LivestreamController
 */
final class LivestreamController extends Controller
{
    /**
     * @return View
     */
    public function getIndex()
    {
        if (!\Cache::has('livestream.status')) {
            $this->postReset();
        }

        $status = \Cache::get('livestream.status');
        $this->nav('navbar.social.title');
        $this->title('livestream.title');

        return $this->view('livestream.index', compact('status'));
    }

    /**
     * @return RedirectResponse
     */
    public function getReset()
    {
        $this->bc(['livestream' => trans('livestream.title')]);
        $this->nav('navbar.social.title');
        $this->title('livestream.reset.title');

        return $this->view('livestream.reset');
    }

    /**
     * @return string
     */
    public function postReset()
    {
        $stream = json_decode(\String::CURL('https://api.twitch.tv/kraken/streams/runetime'));
        if (!empty($stream->stream->game)) {
            \Cache::put('livestream.status', true, \Carbon::now()->addMinutes(10));
        } else {
            \Cache::put('livestream.status', false, \Carbon::now()->addMinutes(10));
        }

        return json_encode(['online' => \Cache::get('livestream.status')]);
    }
}
