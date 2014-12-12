<?php
namespace App\Runis\Accounts;

use App\Runis\Core\Entity;

class UserRole extends Entity {
	protected $table = 'role_user';
	protected $hidden = [];
	protected $fillable = ['user_id', 'role_id', 'important'];
	protected $softDelete = true;
	const PER_MEMBERS_PAGE = 20;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function user() {
		return $this->belongsTo('App\Runis\Accounts\User', 'user_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function role() {
		return $this->belongsTo('App\Runis\Accounts\Role', 'role_id');
	}
}