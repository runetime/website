<?php
namespace App\RuneTime\Statuses;
use App\RuneTime\Forum\Threads\Post;
use App\Runis\Core\Entity;
class Status extends Entity {
	protected $table = 'statuses';
	protected $fillable = ['author_id', 'reply_count', 'status'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_HIDDEN = 0;
	const STATUS_PUBLISHED = 1;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function author() {
		return $this->belongsTo('App\Runis\Accounts\User', 'author_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\MorphMany
	 */
	public function posts() {
		return $this->belongsToMany('App\RuneTime\Forum\Threads\Post');
	}

	/**
	 * @param Post $post
	 */
	public function addPost(Post $post) {
		$this->posts()->attach([$post->id]);
		$this->incrementReplies();
	}

	/**
	 *
	 */
	public function incrementReplies() {
		$this->increment('reply_count');
		$this->save();
	}
}