<?php
class PlayController extends BaseController{
	public function getIndex(){
		$this->nav('Runescape');
		$this->title('Play Runescape');
		$this->view('play.index');
	}
	public function get3(){
		$this->bc(['play'=>'Play Runescape']);
		$this->nav('Runescape');
		$this->title('Runescape 3');
		$this->view('play.3');
	}
	public function getOSRS(){
		$this->bc(['play'=>'Play Runescape']);
		$this->nav('Runescape');
		$this->title('Play Old School Runescape');
		$this->view('play.osrs');
	}
}