<?php
namespace App\RuneTime\Checkup;
use App\Runis\Core\Entity;
use App\Runis\Accounts\User as User;
/**
 * Class Checkup
 * @package App\RuneTime\Checkup
 */
class Checkup extends Entity{
	protected $table = 'staff_checkup';
	protected $fillable = ['active', 'hours_active', 'team'];
	protected $dates = [];
	protected $softDelete = true;
	const PER_PAGE = 20;
	const STATUS_UNCOMPLETED = 0;
	const STATUS_COMPLETED = 1;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function author() {
		return $this->belongsToMany('App\Runis\Accounts\User');
	}

	/**
	 * @param $user
	 */
	public function addAuthor($user) {
		$this->author()->attach([$user->id]);
	}
}