<?php
namespace App\RuneTime\Forum\Polls;

use App\RuneTime\Core\Entity;

class Poll extends Entity
{
	protected $table = 'forum_polls';
	protected $with = [];
	protected $fillable = ['thread_id', 'title'];
	protected $dates = [];
	protected $softDelete = true;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function thread()
	{
		return $this->belongsTo('App\RuneTime\Forum\Threads\Thread', 'thread_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany
	 */
	public function questions()
	{
		return $this->hasMany('App\RuneTime\Forum\Polls\Question');
	}
}