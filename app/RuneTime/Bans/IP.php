<?php
namespace App\RuneTime\Bans;

use App\Runis\Core\Entity;

class IP extends Entity
{
	protected $table = 'bans_ip';
	protected $fillable = ['author_id', 'ip', 'reason', 'status'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_DISABLED = 0;
	const STATUS_ACTIVE = 1;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function author()
	{
		return $this->belongsTo('App\Runis\Accounts\User', 'author_id');
	}
}