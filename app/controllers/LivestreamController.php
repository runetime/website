<?php
class LivestreamController extends BaseController{
	public function getIndex(){
		$this->nav('Social');
		$this->title('Livestream');
		$this->view('livestream.index');
	}
}