<?php
namespace App\Http\Controllers;
class LivestreamController extends BaseController{
	public function getIndex(){
		$this->js('livestream');
		$this->nav('Social');
		$this->title('Livestream');
		return $this->view('livestream.index');
	}
}