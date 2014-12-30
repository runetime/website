<?php
namespace App\RuneTime\Forum\Tags;

use App\RuneTime\Core\Entity;

class Tag extends Entity
{
	protected $table = 'forum_tags';
	protected $with = [];
	protected $fillable = ['author_id', 'name'];
	protected $dates = [];
	protected $softDelete = true;
	const TAGS_PER_THREAD = 10;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function threads()
	{
		return $this->belongsToMany('App\RuneTime\Forum\Threads\Thread');
	}

	public function news()
	{
		return $this->belongsToMany('App\RuneTime\News\News');
	}

	/**
	 * @return array|static[]
	 */
	public function getThreads()
	{
		return \DB::table('tag_thread')->
			where('tag_id', '=', $this->id)->
			orderBy('thread_id', 'desc')->
			get();
	}

	/**
	 * @param $threadId
	 */
	public function addThread($threadId)
	{
		$this->threads()->attach([$this->id, $threadId]);
	}
}