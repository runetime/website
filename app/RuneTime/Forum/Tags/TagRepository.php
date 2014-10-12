<?php
namespace App\RuneTime\Forum\Tags;
use App\Runis\Core\EloquentRepository;
class TagRepository extends EloquentRepository{
	public function __construct(Tag $model){
		$this->model=$model;
	}
	public function getByName($name) {
		return $this->model->
			where('name', '=', $name)->
			first();
	}
	public function addTagThread($tagId, $threadId) {
		return \DB::table('tag_thread')->
			insert([
				'tag_id'    => $tagId,
				'thread_id' => $threadId,
			]);
	}
}