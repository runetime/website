<?php
namespace App\Http\Controllers;
class LivestreamController extends BaseController {
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		if(!\Cache::has('livestream.status')) {
			$this->getReset();
		}
		$status = \Cache::get('livestream.status');
		$this->js('livestream');
		$this->nav('Social');
		$this->title('Livestream');
		return $this->view('livestream.index', compact('status'));
	}

	/**
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function getReset() {
		$stream = json_decode(\String::CURL('https://api.twitch.tv/kraken/streams/runetime'));
		if(!empty($stream->stream->game))
			\Cache::put('livestream.status', true, \Carbon::now()->addMinutes(10)); else
			\Cache::put('livestream.status', false, \Carbon::now()->addMinutes(10));
		return \redirect()->to('/livestream/');
	}
}