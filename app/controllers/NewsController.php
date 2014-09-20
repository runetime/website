<?php
use RT\News\NewsRepository;
class NewsController extends BaseController{
	protected $news;
	public function __construct(NewsRepository $news){
		$this->news=$news;
	}
	public function getIndex(){
		$news=$this->news->getRecentNews(5);
		$canAdd=false;
		if(Auth::check())
			$canAdd=Auth::user()->hasOneOfRoles(1,2,4,6,8,10,12);
		$this->nav('RuneTime');
		$this->title('News');
		$this->view('news.index',compact('news','canAdd'));
	}
	public function getView(){
		$news=$this->news->getById(1);
		return var_dump($news);
	}
	public function getSearch(){
		
	}
	public function getCreate(){
		$this->bc(['news'=>'News']);
		$this->nav('RuneTime');
		$this->title('Create Newspiece');
		$this->view('news.create.form');
	}
	public function postCreate(){
		if(Input::get('name')&&Input::get('image')&&Input::get('contents')){
			$news=new News;
			$news->author_id=Auth::user()->id;
			$news->title=Input::get('name');
			$news->contents=Input::get('contents');
			$news->status=1;
			$news->tags=json_encode(Input::get('tags'));
			$news->comments=0;
		}
	}
}