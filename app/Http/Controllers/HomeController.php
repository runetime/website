<?php
namespace App\Http\Controllers;
use App\RuneTime\News\NewsRepository;
use App\RuneTime\Statuses\StatusRepository;
use App\Runis\Accounts\RoleRepository;
use App\Runis\Accounts\UserRepository;
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
		return $this->view('home.index',compact('news','statuses'));
	}
}