<?php
namespace App\Runis\Accounts;
use App\Runis\Core\Entity;
class Role extends Entity{
	protected $table='roles';

	/**
	 *
	 */
	public function users(){
		$this->belongsToMany('App\Runis\Accounts\User');
	}
}