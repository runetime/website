<?php
namespace App\Runis\Accounts;
use Illuminate\Auth\UserTrait;
use Illuminate\Contracts\Auth\User as UserContract;
use Illuminate\Auth\Passwords\CanResetPasswordTrait;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Database\Eloquent\SoftDeletingTrait;
use App\Runis\Core\Entity;
/**
 * Class User
 * @package App\Runis\Accounts
 */
class User extends Entity implements UserContract, CanResetPasswordContract {
	use UserTrait, CanResetPasswordTrait, SoftDeletingTrait;
	const STATE_ACTIVE  = 1;
	const STATE_BLOCKED = 2;
	protected $table = 'users';
	protected $hidden = [];
	protected $fillable = ['display_name', 'email', 'password'];
	protected $softDelete = true;
	private $rolesCache;

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function roles() {
		return $this->belongsToMany('App\Runis\Accounts\Role');
	}

	/**
	 * @return mixed
	 */
	public function getRoles() {
		if(!isset($this->rolesCache))
			$this->rolesCache = $this->roles;
		return $this->rolesCache;
	}

	/**
	 * @param $roleName
	 *
	 * @return bool
	 */
	public function hasRole($roleName) {
		return in_array($roleName, array_fetch($this->roles->toArray(), 'name'));
	}

	/**
	 * @param array $roleNames
	 *
	 * @return bool
	 * @throws InvalidRoleException
	 */
	public function hasRoles($roleNames = []) {
		$roleList = \App::make('App\Runis\Accounts\RoleRepository')->
			getRoleList();
		foreach((array)$roleNames as $allowedRole) {
			if(!in_array($allowedRole, $roleList))
				throw new InvalidRoleException("Unidentified role: " . $allowedRole);
			if(!$this->roleCollectionHasRole($allowedRole))
				return false;
		}
		return true;
	}

	/**
	 * @return bool
	 */
	public function hasOneOfRoles() {
		foreach(func_get_args() as $role)
			if(in_array($role, array_fetch($this->roles->toArray(), 'id')))
				return true;
		return false;
	}

	/**
	 * @return int
	 */
	public function importantRole() {
		$roles = $this->getRoles();
		if(!empty($roles))
			return $roles[rand(0, count($roles) - 1)];
		return -1;
	}

	/**
	 * @param $allowedRole
	 *
	 * @return bool
	 */
	private function roleCollectionHasRole($allowedRole) {
		$roles = $this->getRoles();
		if(!$roles)
			return false;
		foreach($roles as $role)
			if(strtolower($role->name) == strtolower($allowedRole))
				return true;
		return false;
	}

	/**
	 * @param $name
	 */
	public function setRole($name) {
		$role = \App::make('App\Runis\Accounts\RoleRepository')->
			getByName($name);
		$assigned_roles = [];
		if($role)
			$assigned_roles[] = $role->id;
		$this->roles()->attach($assigned_roles);
	}

	/**
	 * @return bool
	 */
	public function isStaff() {
		return $this->hasOneOfRoles(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13);
	}

	/**
	 * @return int
	 */
	public function incrementPostTotal() {
		return $this->increment('posts_total');
	}

	/**
	 * @return int
	 */
	public function incrementPostActive() {
		$this->increment('posts_total');
		return $this->increment('posts_active');
	}

	/**
	 * @return int
	 */
	public function incrementProfileViews() {
		return $this->increment('profile_views');
	}

	/**
	 * UserInterface
	 */
	public function getAuthIdentifier() {
		return $this->getKey();
	}

	/**
	 * @return mixed
	 */
	public function getAuthPassword() {
		return $this->password;
	}

	/**
	 * RemindableInterface
	 */
	public function getReminderEmail() {
		return $this->email;
	}

	/**
	 * @return mixed
	 */
	public function getRememberToken() {
		return $this->remember_token;
	}

	/**
	 * @param string $newValue
	 */
	public function setRememberToken($newValue) {
		$this->remember_token = $newValue;
	}

	/**
	 * @return string
	 */
	public function getRememberTokenName() {
		return 'remember_token';
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany
	 */
	public function threads() {
		return $this->hasMany('App\RuneTime\Forum\Threads\Thread', 'author_id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function checkups() {
		return $this->belongsToMany('App\RuneTime\Checkup\Checkup');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function messages() {
		return $this->belongsToMany('App\RuneTime\Messenger\Message');
	}
}