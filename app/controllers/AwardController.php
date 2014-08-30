<?php
use RT\Awards\AwardRepository;
class AwardController extends BaseController{
	private $awards;
	public function __construct(AwardRepository $awards){
		$this->awards=$awards;
	}
	public function getIndex(){
		$awards=$this->awards->getAllAwards();
		$this->title('Awards');
		$this->view('awards.index',compact('awards'));
	}
	public function getView($slug){
		$award=$this->awards->getBySlug($slug);
		$awardees=$this->awards->getAwardees($award->id);
		$this->bc(['awards'=>'Awards']);
		$this->title($award->name." Award");
		$this->view('awards.view',compact('award','awardees'));
	}
}