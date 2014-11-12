<?php
namespace App\RuneTime\Forum\Subforums;
use App\Runis\Core\Entity;
use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Forum\Threads\Post;
class Subforum extends Entity{
	protected $table = 'forum_subforums';
	protected $with = [];
	protected $fillable = ['name', 'description', 'threads', 'replies', 'last_post', 'position', 'parent'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_HIDDEN = 0;
	const STATUS_PUBLISHED = 1;
	const THREADS_PER_PAGE = 20;

	public function threads() {
		return $this->hasMany('App\RuneTime\Forum\Threads\Thread', 'subforum_id');
	}

	/**
	 * @return mixed
	 */
	public function lastPost() {
		$posts = new PostRepository(new Post);
		return $posts->getById($this->last_post);
	}

	/**
	 * @return bool
	 */
	public function isRead() {
		if(\Auth::check()) {
			$lastRead = \Cache::get('user' . \Auth::user()->id . '.subforum#' . $this->id . '.read');
			$lastPost = $this->lastPost();
			if(!empty($lastPost) && $lastRead > \Time::getEpoch($this->lastPost()->created_at))
				return true;
			elseif(empty($lastPost))
				return true;
		}
		return false;
	}
}