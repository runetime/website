<?php
namespace App\RuneTime\Radio;

use App\Runis\Core\Entity;

class History extends Entity
{
	protected $table = 'radio_history';
	protected $with = [];
	protected $fillable = ['user_id', 'artist', 'song'];
	protected $dates = [];
	protected $softDelete = true;
	const DEFAULT_AMOUNT = 20;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function user()
	{
		return $this->belongsTo('App\Runis\Accounts\User', 'user_id');
	}
}