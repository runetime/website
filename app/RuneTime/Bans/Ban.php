<?php
namespace App\RuneTime\Bans;
use App\Runis\Core\Entity;
class Ban extends Entity
{
	protected $table = 'bans';
	protected $fillable = ['author_id', 'user_id', 'reason', 'time_ends'];
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