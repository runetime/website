<?php
namespace App\Http\Controllers;
use Illuminate\Routing\Controller;
use Illuminate\Contracts\Auth\Authenticator;
class BaseController extends Controller{
	protected $auth;
	protected $bc;
	protected $displayPageHeader=false;
	protected $js;
	protected $nav;
	protected $title='';
	public function __construct(Authenticator $auth){
		$this->auth=$auth;
	}
	protected function bc($breadcrumbs=[]){
		if($breadcrumbs==false){
			$this->displayPageHeader=false;
		}
		else{
			$this->bc=$breadcrumbs;
		}
	}
	protected function js($js){
		$this->js=$js;
	}
	protected function nav($nav){
		$this->nav=$nav;
	}
	/**
	 * Setup the layout used by the controller.
	 *
	 * @return void
	 */
	protected function setupLayout(){
		if(!is_null($this->layout))
			$this->layout=View::make($this->layout);
	}
	protected function title($newTitle){
		if(!empty($newTitle))
			$this->title=$newTitle;
	}
	protected function view($path,$data=[]){
		$data['bc']=$this->bc;
		$data['displayPageHeader']=$this->displayPageHeader;
		$data['js']=$this->js;
		$data['nav']=$this->nav;
		$data['title']=$this->title;
		return \View::make($path,$data);
	}
}