<?php
namespace App\Runis\Accounts;
use Illuminate\Auth\Authenticatable;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use App\Runis\Core\Entity;
/**
 * Class User
 * @package App\Runis\Accounts
 */
class User extends Entity implements AuthenticatableContract, CanResetPasswordContract {
	use Authenticatable, CanResetPassword;
	protected $table = 'users';
	protected $hidden = [];
	protected $fillable = ['display_name', 'email', 'password', 'title', 'about', 'about_parsed', 'signature', 'signature_parsed', 'posts_active', 'posts_total', 'profile_views', 'birthday', 'gender', 'referred_by', 'timezone', 'dst', 'reputation', 'rank_id', 'social_twitter', 'social_facebook', 'social_youtube', 'social_website', 'social_skype', 'runescape_version', 'runescape_rsn', 'runescape_clan', 'runescape_allegiance', 'location', 'interests'];
	protected $softDelete = true;
	private $rolesCache;
	const PER_MEMBERS_PAGE = 20;

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
	 */
	public function hasRoles($roleNames = []) {
		$roleList = \App::make('App\Runis\Accounts\RoleRepository')->
			getRoleList();
		foreach((array)$roleNames as $allowedRole) {
			if(!in_array($allowedRole, $roleList))
				\Log::error("Unidentified role: " . $allowedRole);
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
		$userRoles = new UserRoleRepository(new UserRole);
		$roles = new RoleRepository(new Role);
		$important = $userRoles->getImportantByUser($this->id);
		$role = $roles->getById($important->role_id);
		return $role;
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
	 * @param Role $role
	 */
	public function removeRole(Role $role) {
		$this->roles()->detach([$role->id]);
	}

	/**
	 * @return bool
	 */
	public function isStaff() {
		return $this->hasOneOfRoles(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13);
	}

	/**
	 * @return bool
	 */
	public function isLeader() {
		return $this->hasOneOfRoles(1, 2, 4, 6, 8, 10, 12);
	}

	/**
	 * @return bool
	 */
	public function isAdmin() {
		return $this->hasOneOfRoles(1);
	}

	/**
	 * @return bool
	 */
	public function isRadio() {
		return $this->hasOneOfRoles(1, 2, 3);
	}

	/**
	 * @return bool
	 */
	public function isMedia() {
		return $this->hasOneOfRoles(1, 4, 5);
	}

	/**
	 * @return bool
	 */
	public function isDeveloper() {
		return $this->hasOneOfRoles(1, 6, 7);
	}

	/**
	 * @return bool
	 */
	public function isContent() {
		return $this->hasOneOfRoles(1, 8, 9);
	}

	/**
	 * @return bool
	 */
	public function isCommunity() {
		return $this->hasOneOfRoles(1, 10, 11);
	}

	/**
	 * @return bool
	 */
	public function isEvents() {
		return $this->hasOneOfRoles(1, 12, 13);
	}

	/**
	 * @return int
	 */
	public function incrementPostTotal() {
		return $this->increment('posts_total');
	}

	/**
	 *
	 */
	public function incrementPostActive() {
		$rank = $this->rank;
		$rankRepository = new RankRepository(new Rank);
		$this->increment('posts_total');
		$this->increment('posts_active');
		$rankAtPosts = $rankRepository->getByPostCount($this->posts_active);
		if($rankAtPosts->id !== $rank->id)
			$this->rank_id = $rankAtPosts->id;
		$this->save();
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

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function tickets() {
		return $this->belongsToMany('App\RuneTime\Tickets\Ticket');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function referredBy() {
		return $this->belongsTo('App\Runis\Accounts\User', 'referred_by');
	}

	public function rank() {
		return $this->belongsTo('App\Runis\Accounts\Rank', 'rank_id');
	}

	/**
	 *
	 */
	public function incrementReputation() {
		$this->increment('reputation');
	}

	/**
	 *
	 */
	public function decrementReputation() {
		$this->decrement('reputation');
	}

	/**
	 * @param $amount
	 */
	public function reputationChange($amount) {
		$this->increment('reputation', $amount);
	}

	/**
	 * @param string $path
	 *
	 * @return string
	 */
	public function toSlug($path = '') {
		return url('profile/' . \String::slugEncode($this->id, $this->display_name) . (!empty($path) ? '/' . $path : ''));
	}
}