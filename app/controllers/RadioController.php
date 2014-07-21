<?php
class RadioController extends BaseController{
	public function index(){
		$dj="Current DJ";
		$song=[
			'artist'=>'Artist',
			'name'=>'Name'
		];
		$page=View::make('radio.index');
		$page->with('css','radio');
		$page->with('js','radio');
		$page->with('nav','Radio');
		$page->with('title','RuneTime Radio');
		$page->with('dj',$dj);
		$page->with('song',$song);
		return $page;
	}
}