<?php
namespace App\RuneTime\Guides;
use App\Runis\Core\EloquentRepository;
class QuestRepository extends EloquentRepository{
	public function __construct(Quest $model){
		$this->model=$model;
	}
	public function getByName($name){
		return $this->model->
			where('name','=',$name)->
			first();
	}
	public function getByAuthor($authorId){
		return $this->model->
			where('author_id','=',$authorId)->
			get();
	}
	public function getByDifficulty($difficulty){
		return $this->model->
			where('difficulty','=',$difficulty)->
			get();
	}
	public function getByLength($length){
		return $this->model->
			where('length','=',$length)->
			get();
	}
	public function getByMembership($membership){
		return $this->model->
			where('membership','=',$membership)->
			get();
	}
	public function getAll(){
		return $this->model->
			get();
	}
	public function getOptions($option){
		return \DB::table('guide_info')->
			where('type','=',strtolower($option))->
			get();
	}
	public function getOptionById($optionId){
		return \DB::table('guide_info')->
			where('id','=',$optionId)->
			first();
	}
}