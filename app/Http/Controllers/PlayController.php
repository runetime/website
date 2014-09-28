<?php
namespace App\Http\Controllers;
class PlayController extends BaseController{
	public function getIndex(){
		$this->nav('Runescape');
		$this->title('Play Runescape');
		return $this->view('play.index');
	}
	public function get3(){
		$this->bc(['play'=>'Play Runescape']);
		$this->nav('Runescape');
		$this->title('Runescape 3');
		return $this->view('play.3');
	}
	public function getOSRS(){
		$this->bc(['play'=>'Play Runescape']);
		$this->nav('Runescape');
		$this->title('Play Old School Runescape');
		return $this->view('play.osrs');
	}
}