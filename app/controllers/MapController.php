<?php
class MapController extends BaseController{
	public function getIndex(){

	}
	public function getMembers(){
		$this->bc(['map'=>'Maps']);
		$this->nav('Social');
		$this->title('Members Map');
		$this->view('map.members');
	}
	public function getRS3(){
		$this->bc(['map'=>'Maps','map/runescape'=>'RuneScape Maps']);
		$this->nav('Runescape');
		$this->title('Runescape3 Map');
		$this->view('map.runescape.3');
	}
	public function getOS(){
		$this->bc(['map'=>'Maps','map/runescape'=>'RuneScape Maps']);
		$this->nav('Runescape');
		$this->title('Old School Map');
		$this->view('map.runescape.old');
	}
}