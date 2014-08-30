<?php
use RT\News\NewsRepository;
class ClanController extends BaseController{
	public function __construct(NewsRepository $news){
		$this->news=$news;
	}
	public function getIndex(){

	}
}