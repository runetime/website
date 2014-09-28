<?php
namespace App\Http\Controllers;
class MapController extends BaseController{
	public function getIndex(){
		$this->title('Maps');
		return $this->view('map.index');
	}
	public function getMembers(){
		$this->bc(['map'=>'Maps']);
		$this->nav('Social');
		$this->title('Members Map');
		return $this->view('map.members');
	}
	public function getRunescape(){
		$this->bc(['map'=>'Maps']);
		$this->nav('Runescape');
		$this->title('Runescape Maps');
		return $this->view('map.runescape.index');
	}
	public function getRS3(){
		$this->bc(['map'=>'Maps','map/runescape'=>'RuneScape Maps']);
		$this->nav('Runescape');
		$this->title('Runescape3 Map');
		return $this->view('map.runescape.3');
	}
	public function getOS(){
		$this->bc(['map'=>'Maps','map/runescape'=>'RuneScape Maps']);
		$this->nav('Runescape');
		$this->title('Old School Map');
		return $this->view('map.runescape.old');
	}
}