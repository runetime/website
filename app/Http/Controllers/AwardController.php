<?php
namespace App\Http\Controllers;
use App\RuneTime\Awards\AwardRepository;
class AwardController extends BaseController{
	private $awards;
	public function __construct(AwardRepository $awards){
		$this->awards=$awards;
	}
	public function getIndex(){
		$awards=$this->awards->getAllAwards();
		$this->nav('RuneTime');
		$this->title('Awards');
		return $this->view('awards.index',compact('awards'));
	}
	public function getView($slug){
		$award=$this->awards->getBySlug($slug);
		$awardees=$this->awards->getAwardees($award->id);
		$this->bc(['awards'=>'Awards']);
		$this->nav('RuneTime');
		$this->title($award->name." Award");
		return $this->view('awards.view',compact('award','awardees'));
	}
}