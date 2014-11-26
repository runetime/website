<?php
namespace App\RuneTime\Forum\Polls;
use App\Runis\Core\Entity;
class Poll extends Entity {
	protected $table = 'forum_polls';
	protected $with = [];
	protected $fillable = ['thread_id', 'questions'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_INVISIBLE = 0;
	const STATUS_VISIBLE = 1;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function thread() {
		return $this->belongsTo('App\RuneTime\Forum\Threads\Thread', 'thread_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany
	 */
	public function answers() {
		return $this->hasMany('App\RuneTime\Forum\Polls\Answer');
	}
}