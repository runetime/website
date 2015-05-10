<?php
namespace App\RuneTime\Awards;

use App\RuneTime\Core\Entity;

/**
 * Class Awardee
 * @package App\RuneTime\Awards
 */
class Awardee extends Entity
{
	protected $table = 'awardees';
	protected $with = [];
	protected $fillable = [
		'award_id',
		'user_id'
	];
	protected $dates = [];
	protected $softDelete = true;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function award()
	{
		return $this->belongsTo('App\RuneTime\Awards\Award', 'award_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function user()
	{
		return $this->belongsTo('App\RuneTime\Accounts\User', 'user_id');
	}
}
