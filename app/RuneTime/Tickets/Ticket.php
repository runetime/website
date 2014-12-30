<?php
namespace App\RuneTime\Tickets;

use App\RuneTime\Forum\Threads\Post;
use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Core\Entity;

class Ticket extends Entity
{
	protected $table = 'tickets';
	protected $fillable = ['author_id', 'name', 'posts_count', 'last_post', 'status'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_OPEN = 0;
	const STATUS_CLOSED = 1;
	const STATUS_ESCALATED = 2;
	const PER_PAGE = 20;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function author()
	{
		return $this->belongsTo('App\RuneTime\Accounts\User', 'author_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function posts()
	{
		return $this->belongsToMany('App\RuneTime\Forum\Threads\Post');
	}

	/**
	 * @param Post $post
	 */
	public function addPost(Post $post)
	{
		$this->posts()->attach([$post->id]);
	}

	/**
	 * @return mixed
	 */
	public function lastPost()
	{
		$posts = new PostRepository(new Post);
		return $posts->getById($this->last_post);
	}

	/**
	 *
	 */
	public function statusSwitch()
	{
		switch($this->status) {
			case Ticket::STATUS_OPEN:
			case Ticket::STATUS_ESCALATED:
				$this->status = TICKET::STATUS_CLOSED;
				break;
			case Ticket::STATUS_CLOSED:
			default:
				$this->status = TICKET::STATUS_OPEN;
				break;
		}
		$this->save();
	}

	/**
	 * @return string
	 */
	public function readableStatus()
	{
		switch($this->status) {
			case TICKET::STATUS_OPEN:
				return 'good';
				break;
			case TICKET::STATUS_CLOSED:
				return 'closed';
				break;
			case TICKET::STATUS_ESCALATED:
			default:
				return 'escalated';
				break;
		}
	}

	/**
	 * @param string $path
	 *
	 * @return string
	 */
	public function toSlug($path = '')
	{
		$url = '';
		if(strlen($path) > 0) {
			$url = '/' . $path;
		}

		return '/tickets/' . \String::slugEncode($this->id, $this->name) . $url;
	}
}