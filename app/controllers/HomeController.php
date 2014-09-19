<?php
use RT\News\NewsRepository;
use RT\Statuses\StatusRepository;
use Runis\Accounts\RoleRepository;
use Runis\Accounts\UserRepository;
class HomeController extends BaseController{
	private $news;
	private $statuses;
	public function __construct(NewsRepository $news,StatusRepository $statuses){
		$this->news=$news;
		$this->statuses=$statuses;
	}
	public function getIndex(){
		$news=$this->news->getRecentNews(3);
		$statuses=$this->statuses->getRecentStatuses(5);
		$this->bc(false);
		$this->title('Home');
		$this->view('home.index',compact('news','statuses'));
	}
}