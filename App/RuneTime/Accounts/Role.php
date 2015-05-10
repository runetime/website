<?php
namespace App\RuneTime\Accounts;

use App\RuneTime\Core\Entity;

/**
 * Class Role
 * @package App\RuneTime\Accounts
 */
class Role extends Entity
{
	protected $table = 'roles';

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function users()
	{
		return $this->belongsToMany('App\RuneTime\Accounts\User');
	}
}