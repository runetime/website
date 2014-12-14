<?php
namespace App\Http\Controllers;

class LivestreamController extends BaseController
{
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		if(!\Cache::has('livestream.status')) {
			$this->postReset();
		}

		$status = \Cache::get('livestream.status');
		$this->nav('navbar.social.social');
		$this->title(trans('livestream.title'));
		return $this->view('livestream.index', compact('status'));
	}

	/**
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function getReset()
	{
		$this->bc(['livestream' => trans('livestream.title')]);
		$this->nav('navbar.social.social');
		$this->title(trans('livestream.reset.title'));
		return $this->view('livestream.reset');
	}

	/**
	 * @return string
	 */
	public function postReset()
	{
		$stream = json_decode(\String::CURL('https://api.twitch.tv/kraken/streams/runetime'));
		if(!empty($stream->stream->game)) {
			\Cache::put('livestream.status', true, \Carbon::now()->addMinutes(10));
		} else {
			\Cache::put('livestream.status', false, \Carbon::now()->addMinutes(10));
		}

		return json_encode(['online' => \Cache::get('livestream.status')]);
	}
}