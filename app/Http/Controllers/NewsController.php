<?php
namespace App\Http\Controllers;
use App\RuneTime\News\News;
use App\RuneTime\News\NewsRepository;
use Illuminate\Contracts\Auth\Authenticator;
class NewsController extends BaseController{
	protected $auth;
	protected $news;
	public function __construct(Authenticator $auth,NewsRepository $news){
		$this->auth=$auth;
		$this->news=$news;
	}
	public function getIndex(){
		$news=$this->news->getRecentNews(5);
		$canAdd=false;
		if($this->auth->check())
			$canAdd=Auth::user()->hasOneOfRoles(1,2,4,6,8,10,12);
		$this->nav('RuneTime');
		$this->title('News');
		return $this->view('news.index',compact('news','canAdd'));
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
		return $this->view('news.create.form');
	}
	public function postCreate(){
		if(Input::get('name')&&Input::get('contents')){
			$news=new News;
			$news->author_id=Auth::user()->id;
			$news->title=Input::get('name');
			$news->contents=Input::get('contents');
			$news->status=News::STATUS_PUBLISHED;
			$news->comments=0;
			$news->save();
			if(Input::file('image')&&Input::file('image')->isValid()){
				Input::file('image')->move('./img/news/'.$news->id.'.png');
			}
		}
		else{
			return 1;
		}
	}
}