<?php
namespace App\RuneTime\Awards;

use App\Runis\Core\Entity;

class Awardee extends Entity
{
	protected $table = 'awardees';
	protected $with = [];
	protected $fillable = ['award_id', 'user_id'];
	protected $dates = [];
	protected $softDelete = true;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function award()
	{
		return $this->belongsTo('Award', 'author_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function user()
	{
		return $this->belongsToMany('App\Runis\Accounts\User', 'user_id');
	}
}
