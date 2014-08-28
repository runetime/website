<?php
use RT\Awards\AwardRepository;
class AwardController extends BaseController{
	private $awards;
	public function __construct(AwardRepository $awards){
		$this->awards=$awards;
	}
	public function getIndex(){

	}
	public function getView($slug){

	}
}
