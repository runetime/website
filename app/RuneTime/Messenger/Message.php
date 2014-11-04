<?php
namespace App\RuneTime\Messenger;
use App\Runis\Core\Entity;
/**
 * Class Message
 * @package App\RuneTime\Messenger
 */
class Message extends Entity {
	protected $table = 'messenger_messages';
	protected $with = [];
	protected $fillable = ['author_id', 'title', 'participants', 'view_count', 'reply_count'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_INVISIBLE = 0;
	const STATUS_VISIBLE = 1;

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
	public function author() {
		return $this->belongsTo('App\Runis\Accounts\User');
	}

	/**
	 * @return mixed
	 */
	public function users() {
		return $this->belonsgToMany('App\Runis\Accounts\User');
	}
}