<?php
namespace App\RuneTime\Awards;

use App\Runis\Core\Entity;

class Awardee extends Entity{
	protected $table = 'awardees';
	protected $with = [];
	protected $fillable = ['award_id', 'user_id', 'status'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_INACTIVE = 0;
	const STATUS_ACTIVE = 1;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function award() {
		return $this->belongsTo('Award', 'author_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function users() {
		return $this->belongsTo('App\Runis\Accounts\User', 'user_id');
	}
}
