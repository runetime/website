<?php
namespace App\RuneTime\Radio;
use App\Runis\Core\Entity;
/**
 * Class Request
 * @package App\RuneTime\Radio
 */
class Request extends Entity{
	protected $table = 'radio_requests';
	protected $with = [];
	protected $fillable = ['author_id', 'song_artist', 'song_name', 'ip_address', 'status'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_NEUTRAL = 0;
	const STATUS_ACCEPTED = 1;
	const STATUS_REJECTED = 2;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function author() {
		return $this->belongsTo('App\Runis\Accounts\User', 'author_id');
	}
}