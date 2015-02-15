<?php
namespace App\RuneTime\Statuses;

use App\RuneTime\Forum\Threads\Post;
use App\RuneTime\Core\Entity;

/**
 * Class Status
 * @package App\RuneTime\Statuses
 */
class Status extends Entity
{
	protected $table = 'statuses';
	protected $fillable = [
		'author_id',
		'reply_count',
		'status'
	];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_HIDDEN = 0;
	const STATUS_PUBLISHED = 1;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function author()
	{
		return $this->belongsTo('App\RuneTime\Accounts\User', 'author_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\MorphMany
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
		$this->incrementReplies();
	}

	/**
	 *
	 */
	public function incrementReplies()
	{
		$this->increment('reply_count');
		$this->save();
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

		return '/forums/statuses/' . \String::slugEncode($this->id, 'by-', $this->author->display_name) . $url;
	}

	/**
	 * @return bool
	 */
	public function canView()
	{
		$can = false;
		if($this->status == Status::STATUS_PUBLISHED) {
			$can = true;
		} else {
			if(\Auth::check() && \Auth::user()->isCommunity()) {
				$can = true;
			}
		}

		return $can;
	}
}