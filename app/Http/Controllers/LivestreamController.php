<?php
namespace App\Http\Controllers;
class LivestreamController extends BaseController {
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		if(!\Cache::has('livestream.status'))
			$this->getReset();
		$status = \Cache::get('livestream.status');
		$this->js(['chatbox']);
		$this->nav('navbar.social.social');
		$this->title('Livestream');
		return $this->view('livestream.index', compact('status'));
	}

	/**
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function getReset() {
		$this->bc(['livestream' => 'Livestream']);
		$this->nav('Social');
		$this->title('Reset');
		return $this->view('livestream.reset');
	}

	/**
	 * @return string
	 */
	public function postReset() {
		$stream = json_decode(\String::CURL('https://api.twitch.tv/kraken/streams/runetime'));
		if(!empty($stream->stream->game))
			\Cache::put('livestream.status', true, \Carbon::now()->addMinutes(10));
		else
			\Cache::put('livestream.status', false, \Carbon::now()->addMinutes(10));
		header('Content-Type: application/json');
		return json_encode(['online' => \Cache::get('livestream.status')]);
	}
}