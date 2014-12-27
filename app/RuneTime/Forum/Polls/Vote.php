<?php
namespace App\RuneTime\Forum\Polls;

use App\Runis\Core\Entity;

class Vote extends Entity
{
	protected $table = 'forum_poll_votes';
	protected $with = [];
	protected $fillable = ['answer_id', 'author_id', 'poll_id', 'question_id'];
	protected $dates = [];
	protected $softDelete = true;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function answer()
	{
		return $this->belongsTo('App\RuneTime\Forum\Polls\Answer', 'answer_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function author()
	{
		return $this->belongsTo('App\Runis\Accounts\User', 'author_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function poll()
	{
		return $this->belongsTo('App\RuneTime\Forum\Polls\Poll', 'poll_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function question()
	{
		return $this->belongsTo('App\RuneTime\Forum\Polls\Question', 'question_id');
	}
}