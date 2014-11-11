<?php
namespace App\RuneTime\Tickets;
use App\RuneTime\Forum\Threads\Post;
use App\RuneTime\Forum\Threads\PostRepository;
use App\Runis\Core\Entity;
class Ticket extends Entity {
	protected $table = 'tickets';
	protected $fillable = ['author_id', 'name', 'posts_count', 'last_post', 'status'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_OPEN = 0;
	const STATUS_CLOSED = 1;
	const PER_PAGE = 20;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function author() {
		return $this->belongsTo('App\Runis\Accounts\User', 'author_id');
	}

	public function posts() {
		return $this->belongsToMany('App\RuneTime\Forum\Threads\Post');
	}

	/**
	 * @param Post $post
	 */
	public function addPost(Post $post) {
		$this->posts()->attach([$post->id]);
	}

	public function lastPost() {
		$posts = new PostRepository(new Post);
		return $posts->getById($this->last_post);
	}

	public function switchStatus() {
		$this->status = $this->status == Ticket::STATUS_CLOSED ? Ticket::STATUS_OPEN : Ticket::STATUS_CLOSED;
		$this->save();
	}
}