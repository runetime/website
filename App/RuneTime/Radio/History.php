<?php
namespace App\RuneTime\Radio;

use App\RuneTime\Core\Entity;

/**
 * Class History
 * @package App\RuneTime\Radio
 */
class History extends Entity
{
	protected $table = 'radio_history';
	protected $with = [];
	protected $fillable = [
		'user_id',
		'artist',
		'song'
	];
	protected $dates = [];
	protected $softDelete = true;
	const DEFAULT_AMOUNT = 20;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function user()
	{
		return $this->belongsTo('App\RuneTime\Accounts\User', 'user_id');
	}
}