<?php
namespace App\Http\Controllers;
class ForumController extends BaseController{
	public function __construct(){
		
	}
	public function getIndex(){
		$this->nav('Forums');
		$this->title('Forums');
		return $this->view('forum.index');
	}
}