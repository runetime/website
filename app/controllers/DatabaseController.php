<?php
use RT\Databases\DatabaseRepository;
class DatabaseController extends BaseController{
	private $databases;
	public function __construct(DatabaseRepository $databases){
		$this->databases=$databases;
	}
	public function getIndex(){

	}
	public function getViewDatabase(){

	}
	public function getViewItem(){

	}
	public function getSearch(){

	}
}
