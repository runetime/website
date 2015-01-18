<?php
namespace App\RuneTime\Radio;

use App\RuneTime\Core\Entity;

class Session extends Entity
{
	protected $table = 'radio_sessions';
	protected $with = [];
	protected $fillable = ['dj_id', 'message_id', 'status'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_DONE = 0;
	const STATUS_PLAYING = 1;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function message()
	{
		return $this->belongsTo('App\RuneTime\Radio\Message', 'message_id');
	}

	public function dj()
	{
		return $this->belongsTo('App\RuneTime\Accounts\User', 'dj_id');
	}
}