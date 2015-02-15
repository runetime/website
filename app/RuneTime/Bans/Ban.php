<?php
namespace App\RuneTime\Bans;

use App\RuneTime\Core\Entity;

/**
 * Class Ban
 * @package App\RuneTime\Bans
 */
class Ban extends Entity
{
	protected $table = 'bans';
	protected $fillable = [
		'author_id',
		'user_id',
		'reason',
		'time_ends'
	];
	protected $dates = [];
	protected $softDelete = true;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function author()
	{
		return $this->belongsTo('App\RuneTime\Accounts\User', 'author_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function user()
	{
		return $this->belongsTo('App\RuneTime\Accounts\User', 'user_id');
	}
}