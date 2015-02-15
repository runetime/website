<?php
namespace App\RuneTime\Accounts;

use App\RuneTime\Core\Entity;

/**
 * Class Rank
 * @package App\RuneTime\Accounts
 */
class Rank extends Entity
{
	protected $table = 'forum_ranks';
	protected $hidden = [];
	protected $fillable = ['name', 'posts_required'];
	protected $softDelete = true;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany
	 */
	public function users()
	{
		return $this->hasMany('App\RuneTime\Accounts\User', 'rank_id');
	}

	/**
	 * @return mixed
	 */
	public function toClassName()
	{
		return str_replace(" ", "-", strtolower($this->name));
	}

	/**
	 * @return mixed
	 */
	public function toNameTrim()
	{
		return str_replace(" ", "_", strtolower($this->name));
	}
}