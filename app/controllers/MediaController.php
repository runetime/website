<?php
class MediaController extends BaseController{
	public function getIndex(){
		$this->nav('Social');
		$this->title('Social Media');
		$this->view('media.index');
	}
}