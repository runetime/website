<?php
namespace App\RuneTime\Forum\Reports;

use App\RuneTime\Core\Entity;

class Report extends Entity
{
	protected $table = 'forum_reports';
	protected $with = [];
	protected $fillable = ['author_id', 'reported_id', 'type_id', 'status_id'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_OPEN = 0;
	const STATUS_CLOSED = 1;
	const TYPE_POST = 0;
	const TYPE_THREAD = 1;
	const TYPE_USER = 2;

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
	public function addPost($post)
	{
		$this->posts()->attach([$post->id]);
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function thread()
	{
		return $this->belongsTo('App\RuneTime\Forum\Threads\Thread', 'reported_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function post()
	{
		return $this->belongsTo('App\RuneTime\Forum\Threads\Post', 'reported_id');
	}

	/**
	 * @return string
	 */
	public function getStatus()
	{
		switch($this->status_id) {
			case 0:
				return 'open';
				break;
			case 1:
				return 'closed';
				break;
			default:
				\Log::info('Report :: unknown status type ' . $this->status_id);
				return 'unknown';
				break;
		}
	}
}