<?php
class PlayController extends BaseController{
	public function getIndex(){
		$this->nav('Runescape');
		$this->title('Play Runescape');
		$this->view('play.index');
	}
}