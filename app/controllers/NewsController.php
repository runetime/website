<?php
use RT\News\NewsRepository;
class NewsController extends BaseController{
	protected $news;
	public function __construct(NewsRepository $news){
		$this->news=$news;
	}
	public function getIndex(){
		$news=$this->news->getRecentNews(5);
		$this->title='News';
		$this->view('news.index',compact('news'));
	}
	public function getView(){
		$news=$this->news->getNews(1);
	}
	public function getSearch(){
		
	}
}
