<?php
namespace RT\Guides;
use McCool\LaravelAutoPresenter\BasePresenter;
use App,Input,Str,Request;
class QuestPresenter extends BasePresenter{
class QuestPresenter extends BasePresenter{
	public function created_ago(){
		return $this->resource->
			created_at->
			diffForHumans();
	}
}