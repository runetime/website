<?php
namespace App\RuneTime\Bans;

use App\Runis\Core\Entity;

class Mute extends Entity {
	protected $table = 'mutes';
	protected $fillable = ['author_id', 'user_id', 'reason', 'reason_parsed', 'time_start', 'time_end'];
	protected $dates = [];
	protected $softDelete = true;

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
	public function user()
	{
		return $this->belongsTo('App\Runis\Accounts\User', 'user_id');
	}
}