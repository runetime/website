<?php
namespace App\RuneTime\Forum\Subforums;
use App\Runis\Core\EloquentRepository;
class SubforumRepository extends EloquentRepository{
	public function __construct(Subforum $model){
		$this->model=$model;
	}
	public function getByParent($id){
		return $this->model->
			where('parent',$id)->
			get();
	}
	public function getById($id){
		return $this->model->
			where('id','=',$id)->
			first();
	}
	public function updateLastPost($postId, $subforumId) {
		$subforum = Subforum::find($subforumId);
		while(true) {
			if(!empty($subforum)) {
				$subforum->last_post = $postId;
				$subforum->save();
				if($subforum->parent > 0)
					$subforum = Subforum::find($subforum->parent);
				else
					break;
			}
			else{
				break;
			}
		}
		return true;
	}
	public function incrementPosts($subforumId) {
		$subforum = Subforum::find($subforumId);
		while(true){
			if(!empty($subforum)){
				$subforum->increment('posts');
				$subforum->save();
				$subforum = Subforum::find($subforum->parent);
			}
			else
				break;
		}
	}
	public function incrementThreads($subforumId) {
		$subforum = Subforum::find($subforumId);
		while(true){
			if(!empty($subforum)){
				$subforum->increment('threads');
				$subforum->save();
				$subforum = Subforum::find($subforum->parent);
			}
			else
				break;
		}
	}
}