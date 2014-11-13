<?php
namespace App\RuneTime\Forum\Subforums;
use App\Runis\Core\EloquentRepository;
class SubforumRepository extends EloquentRepository {
	/**
	 * @param Subforum $model
	 */
	public function __construct(Subforum $model) {
		$this->model = $model;
	}

	/**
	 * @param $id
	 *
	 * @return mixed
	 */
	public function getByParent($id) {
		return $this->model->
			where('parent', $id)->
			get();
	}

	/**
	 * @param $id
	 *
	 * @return mixed
	 */
	public function getById($id) {
		return $this->model->
			where('id', '=', $id)->
			first();
	}

	/**
	 * @param $postId
	 * @param $subforumId
	 *
	 * @return bool
	 */
	public function updateLastPost($postId, $subforumId) {
		$subforum = $this->model->
			where('id', '=', $subforumId)->
			first();
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

	/**
	 * @param $subforumId
	 */
	public function incrementPosts($subforumId) {
		$subforum = $this->model->
			where('id', '=', $subforumId)->
			first();
		while(true){
			if(!empty($subforum)){
				$subforum->increment('post_count');
				$subforum->save();
				$subforum = $this->model->
					where('id', '=', $subforum->parent)->
					first();
			}
			else
				break;
		}
	}

	/**
	 * @param $subforumId
	 */
	public function incrementThreads($subforumId) {
		$subforum = $this->model->
			where('id', '=', $subforumId)->
			first();
		while(true){
			if(!empty($subforum)){
				$subforum->increment('thread_count');
				$subforum->save();
				$subforum = Subforum::find($subforum->parent);
			}
			else
				break;
		}
	}
}