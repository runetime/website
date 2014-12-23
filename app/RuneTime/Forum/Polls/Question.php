<?php
namespace App\RuneTime\Forum\Polls;

use App\Runis\Core\Entity;

class Question extends Entity
{
	protected $table = 'forum_poll_questions';
	protected $with = [];
	protected $fillable = ['poll_id', 'contents'];
	protected $dates = [];
	protected $softDelete = true;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function poll()
	{
		return $this->belongsTo('App\RuneTime\Forum\Polls\Poll', 'poll_id');
	}

	public function answers()
	{
		return $this->hasMany('App\RuneTime\Forum\Polls\Answer');
	}
}