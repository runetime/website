<?php
class RadioController extends BaseController{
	public function getIndex(){
		$this->title='RuneTime Radio';
		$this->view('radio.index');
	}
}
