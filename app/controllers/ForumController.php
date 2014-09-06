<?php
class ForumController extends BaseController{
	public function __construct(){
		
	}
	public function getIndex(){
		$this->title('Forums');
		$this->view('forum.index');
	}
}