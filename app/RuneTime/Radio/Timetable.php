<?php
namespace App\RuneTime\Radio;

use App\Runis\Core\Entity;

class Timetable extends Entity
{
	protected $table = 'radio_timetables';
	protected $with = [];
	protected $fillable = ['dj_id', 'year', 'day', 'hour'];
	protected $dates = [];
	protected $softDelete = true;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function dj()
	{
		return $this->belongsTo('App\Runis\Accounts\User', 'dj_id');
	}
}