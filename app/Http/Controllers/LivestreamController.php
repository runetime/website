<?php
namespace App\Http\Controllers;
class LivestreamController extends BaseController{
	public function getIndex($reset = false){
		if(!\Cache::has('livestream.status') || $reset) {
			$stream = json_decode(\String::CURL('https://api.twitch.tv/kraken/streams/runetime'));
			if(!empty($stream->stream->id))
				\Cache::put('livestream.status', true, \Carbon::now()->addMinutes(10));
			else
				\Cache::put('livestream.status', false, \Carbon::now()->addMinutes(10));
		}
		$streaming = \Cache::get('livestream.status');
		dd($streaming);
		$this->js('livestream');
		$this->nav('Social');
		$this->title('Livestream');
		return $this->view('livestream.index');
	}
}