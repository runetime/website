<?php
namespace App\RuneTime\Forum\Threads;
use App\Runis\Core\Entity;
class Thread extends Entity {
	protected $table = 'forum_threads';
	protected $with = [];
	protected $fillable = ['author_id', 'subforum_id', 'title', 'views_count', 'posts_count', 'last_post', 'poll', 'status'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_INVISIBLE = 0;
	const STATUS_VISIBLE = 1;
	const STATUS_INVISIBLE_PINNED = 2;
	const STATUS_VISIBLE_PINNED = 3;
	const STATUS_INVISIBLE_LOCKED = 4;
	const STATUS_VISIBLE_LOCKED = 5;
	const STATUS_INVISIBLE_LOCKED_PINNED = 6;
	const STATUS_VISIBLE_LOCKED_PINNED = 7;
	const POSTS_PER_PAGE  = 20;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function posts() {
		return $this->belongsToMany('App\RuneTime\Forum\Threads\Post');
	}

	/**
	 * @param Post $post
	 */
	public function addPost(Post $post) {
		$this->posts()->attach([$post->id]);
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function subforum() {
		return $this->belongsTo('App\RuneTime\Forum\Subforums\Subforum', 'subforum_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function user() {
		return $this->author;
	}

	public function author() {
		return $this->belongsTo('App\Runis\Accounts\User', 'author_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function tags() {
		return $this->belongsToMany('App\RuneTime\Forum\Tags\Tag');
	}

	/**
	 * @param $tag
	 */
	public function addTag($tag) {
		$this->tags()->attach([$tag->id]);
	}

	/**
	 * @param Post $post
	 */
	public function updateLastPost(Post $post) {
		$this->last_post = $post->id;
		$this->save();
	}

	/**
	 *
	 */
	public function incrementViews() {
		$this->increment('views_count');
		$this->save();
	}

	/**
	 *
	 */
	public function incrementPosts() {
		$this->increment('posts_count');
		$this->save();
	}

	/**
	 * @return bool
	 */
	public function isPinned() {
		if($this->status >= 2 && $this->status <= 3)
			return true;
		if($this->status == 6 || $this->status == 7)
			return true;
		return false;
	}

	/**
	 * @return bool
	 */
	public function isLocked() {
		if($this->status >= 4)
			return true;
		return false;
	}

	/**
	 * @return bool
	 */
	public function isPoll() {
		if($this->poll > -1)
			return true;
		return false;
	}

	/**
	 * @return bool
	 */
	public function isVisible() {
		if($this->status % 2 == 1)
			return true;
		return false;
	}

	/**
	 * @return mixed
	 */
	public function getStatusLockSwitch() {
		if($this->status < 4)
			return $this->status + 4;
		return $this->status - 4;
	}

	/**
	 * @return mixed
	 */
	public function getStatusPinSwitch() {
		if($this->status == 2 || $this->status == 3 || $this->status == 6 || $this->status == 7)
			return $this->status - 2;
		else
			return $this->status + 2;
	}

	/**
	 * @return mixed
	 */
	public function getStatusHiddenSwitch() {
		if($this->status % 2 == 1)
			return $this->status - 1;
		return $this->status + 1;
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
			$lastRead = \Cache::get('user' . \Auth::user()->id . '.thread#' . $this->id . '.read');
			if($lastRead > \Time::getEpoch($this->lastPost()->created_at))
				return true;
			else
				return false;
		}
		return true;
	}

	/**
	 * @return string
	 */
	public function toSlug($path = '') {
		return '/forums/thread/' . \String::slugEncode($this->id, $this->title) . (!empty($path) ? '/' . $path : '');
	}
}