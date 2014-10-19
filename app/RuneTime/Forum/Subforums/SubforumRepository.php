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

	/**
	 * @param $subforumId
	 */
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

	/**
	 * @param $subforumId
	 */
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