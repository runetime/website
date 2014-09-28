<?php
namespace App\RuneTime\Guides;
use McCool\LaravelAutoPresenter\BasePresenter;
use App,Input,Str,Request;
class QuestPresenter extends BasePresenter{
	public function created_ago(){
		return $this->resource->
			created_at->
			diffForHumans();
	}
}