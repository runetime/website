<?php
class HomeController extends BaseController{
	public function index(){
		$page=View::make('home');
		$page->with('css','home');
		$page->with('js','home');
		return $page;
	}
}