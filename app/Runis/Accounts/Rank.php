<?php
namespace App\Runis\Accounts;
use App\Runis\Core\Entity;
class Rank extends Entity{
	protected $table='forum_ranks';
	protected $hidden = [];
	protected $fillable = ['name', 'posts_required'];
	protected $softDelete = true;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany
	 */
	public function users(){
		return $this->hasMany('App\Runis\Accounts\User', 'rank_id');
	}

	/**
	 * @return mixed
	 */
	public function toClassName() {
		return str_replace(" ", "-", strtolower($this->name));
	}

	/**
	 * @return mixed
	 */
	public function toNameTrim() {
		return str_replace(" ", "_", strtolower($this->name));
	}
}