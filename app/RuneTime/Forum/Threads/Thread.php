<?php
namespace App\RuneTime\Forum\Threads;
use App\Runis\Core\Entity;
class Thread extends Entity {
	protected $table = 'forum_threads';
	protected $with = [];
	protected $fillable = ['author_id', 'title', 'views_count', 'posts_count', 'last_post', 'poll', 'status', 'tags', 'subforum_id'];
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
		return $this->belongsTomany('App\RuneTime\Forum\Threads\Post');
	}

	/**
	 * @param Post $post
	 */
	public function addPost(Post $post) {
		$this->posts()->attach([$post->id]);
	}

	public function subforum() {
		return $this->belongsTo('App\RuneTime\Forum\Subforums\Subforum', 'subforum_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function user() {
		return $this->belongsTo('App\Runis\Accounts\User', 'author_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany
	 */
	public function tags() {
		return $this->hasMany('Tag');
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
	public function getStatusLockSwitch() {
		if($this->status < 4)
			return $this->status + 4;
		if($this->status >= 4)
			return $this->status - 4;
	}
	public function getStatusPinSwitch() {
		if($this->status == 2 || $this->status == 3 || $this->status == 6 || $this->status == 7)
			return $this->status - 2;
		else
			return $this->status + 2;
	}
	public function getStatusHiddenSwitch() {
		if($this->status % 2 == 1)
			return $this->status - 1;
		return $this->status + 1;
	}
}