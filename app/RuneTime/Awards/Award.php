<?php
namespace App\RuneTime\Awards;

use App\Runis\Core\Entity;

class Award extends Entity
{
	protected $table = 'awards';
	protected $with = [];
	protected $fillable = ['name', 'name_trim', 'description', 'last_awarded', 'status'];
	protected $dates = [];
	protected $softDelete = true;
	const STATUS_UNAVAILABLE = 0;
	const STATUS_AVAILABLE = 1;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function awardees()
	{
		return $this->belongsToMany('App\RuneTime\Awards\Awardee');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function users()
	{
		return $this->belongsToMany('App\RuneTime\Awards\Awardee');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function lastAwarded()
	{
		return $this->belongsTo('App\RuneTime\Awards\Awardee', 'last_awarded');
	}
}
