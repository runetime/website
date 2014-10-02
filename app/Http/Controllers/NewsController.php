<?php
namespace App\Http\Controllers;
use App\Http\Requests\NewsForm;
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
			$canAdd=$this->auth->user()->hasOneOfRoles(1,2,4,6,8,10,12);
		$this->nav('RuneTime');
		$this->title('News');
		return $this->view('news.index',compact('news','canAdd'));
	}
	public function getView($slug){
		$news=$this->news->getById(\String::slugDecode($slug)['id']);
		$this->bc(['news'=>'News']);
		$this->nav('News');
		$this->title($news->title);
		$comments=[];
		$tags="test";
		return $this->view('news.view',compact('news','comments','tags'));
	}
	public function getSearch(){
		
	}
	public function getCreate(){
		$this->bc(['news'=>'News']);
		$this->nav('RuneTime');
		$this->title('Create Newspiece');
		return $this->view('news.create.form');
	}
	public function postCreate(NewsForm $form){
		$news=new News;
		$news->author_id=$this->auth->user()->id;
		$news->title=$form->input('name');
		$news->contents=$form->input('contents');
		$news->status=News::STATUS_PUBLISHED;
		$news->comments=0;
		$news->save();
		if($form->hasFile('image')&&$form->file('image')->isValid()){
			$form->file('image')->move('./img/news/'.$news->id.'.png');
		}
		return redirect()->action('NewsController@getView',['slug'=>\String::slugEncode($news->id,$news->title)]);
	}
}