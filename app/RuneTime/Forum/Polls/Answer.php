<?php
namespace App\RuneTime\Forum\Polls;

use App\Runis\Core\Entity;

class Answer extends Entity
{
	protected $table = 'forum_poll_answers';
	protected $with = [];
	protected $fillable = ['question_id', 'contents', 'votes'];
	protected $dates = [];
	protected $softDelete = true;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function question()
	{
		return $this->belongsTo('App\RuneTime\Forum\Polls\Question', 'question_id');
	}
}