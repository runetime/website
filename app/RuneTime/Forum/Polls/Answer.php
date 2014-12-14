<?php
namespace App\RuneTime\Forum\Polls;
use App\Runis\Core\Entity;
class Answer extends Entity
{
	protected $table = 'forum_poll_answers';
	protected $with = [];
	protected $fillable = ['author_id', 'poll_id', 'answers'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_INVISIBLE = 0;
	const STATUS_VISIBLE = 1;

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
}