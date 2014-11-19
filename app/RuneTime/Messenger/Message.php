<?php
namespace App\RuneTime\Messenger;
use App\Runis\Core\Entity;
use App\RuneTime\Forum\Threads\Post;
use App\Runis\Accounts\User;
/**
 * Class Message
 * @package App\RuneTime\Messenger
 */
class Message extends Entity {
	protected $table = 'messages';
	protected $with = [];
	protected $fillable = ['author_id', 'title', 'views', 'replies'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_INVISIBLE = 0;
	const STATUS_VISIBLE = 1;

	/**
	 *
	 */
	public function incrementReplies() {
		$this->increment('replies');
		$this->save();
	}

	/**
	 *
	 */
	public function incrementViews() {
		$this->increment('views');
		$this->save();
	}

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
		$this->incrementReplies();
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
		return $this->belongsToMany('App\Runis\Accounts\User');
	}

	/**
	 * @param User $user
	 */
	public function addUser(User $user) {
		$this->users()->attach([$user->id]);
	}

	public function toSlug() {
		return '/messenger/' . \String::slugEncode($this->id, $this->title);
	}
}