<?php
class BaseController extends Controller{
	protected $layout='layouts.default';
	protected $currentUser;
	protected $title='';
	/**
	 * Setup the layout used by the controller.
	 *
	 * @return void
	 */
	protected function setupLayout(){
		if(!is_null($this->layout))
			$this->layout=View::make($this->layout);
	}
	protected function title($newTitle){
		if(!empty($newTitle))
			$this->title=$newTitle;
	}
	protected function view($path,$data=[]){
		$this->layout->title=$this->title;
		$this->layout->contents=View::make($path,$data);
	}
}
