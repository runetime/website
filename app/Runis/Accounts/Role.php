<?php
namespace App\Runis\Accounts;

use App\Runis\Core\Entity;

class Role extends Entity
{
	protected $table = 'roles';

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function users()
	{
		return $this->belongsToMany('App\Runis\Accounts\User');
	}
}