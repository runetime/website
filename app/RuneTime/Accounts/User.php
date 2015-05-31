<?php
namespace App\RuneTime\Accounts;

use App\RuneTime\Core\Entity;
use Illuminate\Auth\Authenticatable;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;

/**
 * Class User
 */
class User extends Entity implements AuthenticatableContract, CanResetPasswordContract
{
    use Authenticatable, CanResetPassword;
    protected $table = 'users';
    protected $hidden = [];
    protected $fillable = [
        'about',
        'about_parsed',
        'birthday_day',
        'birthday_month',
        'birthday_year',
        'display_name',
        'dst',
        'email',
        'gender',
        'last_active',
        'password',
        'profile_views',
        'posts_active',
        'posts_total',
        'social_facebook',
        'social_skype',
        'social_twitter',
        'social_website',
        'social_youtube',
        'rank_id',
        'referred_by',
        'reputation',
        'runescape_allegiance',
        'runescape_clan',
        'runescape_rsn',
        'runescape_version',
        'signature',
        'signature_parsed',
        'timezone',
        'title',
    ];
    protected $softDelete = true;
    private $rolesCache;
    private $cacheStatus = null;
    const PER_MEMBERS_PAGE = 20;
    const GENDER_NOT_TELLING = 0;
    const GENDER_FEMALE = 1;
    const GENDER_MALE = 2;

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function roles()
    {
        return $this->belongsToMany('App\RuneTime\Accounts\Role');
    }

    /**
     * @return mixed
     */
    public function getRoles()
    {
        if (!isset($this->rolesCache)) {
            $this->rolesCache = $this->belongsToMany('App\RuneTime\Accounts\Role');
        }

        return $this->rolesCache;
    }

    /**
     * @param $roleName
     *
     * @return bool
     */
    public function hasRole($roleName)
    {
        return in_array($roleName, array_fetch($this->roles->toArray(), 'name'));
    }

    /**
     * @param array $roleNames
     *
     * @return bool
     */
    public function hasRoles($roleNames = [])
    {
        $roleList = \App::make('App\RuneTime\Accounts\RoleRepository')->
            getRoleList();
        foreach ((array) $roleNames as $allowedRole) {
            if (!in_array($allowedRole, $roleList)) {
                \Log::error('Unidentified role: ' . $allowedRole);
            }

            if (!$this->roleCollectionHasRole($allowedRole)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @return bool
     */
    public function hasOneOfRoles()
    {
        foreach (func_get_args() as $role) {
            if (in_array($role, array_fetch($this->roles->toArray(), 'id'))) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return int
     */
    public function importantRole()
    {
        $userRoles = \App::make('App\RuneTime\Accounts\UserRoleRepository');
        $important = $userRoles->getImportantByUser($this->id);

        $roles = \App::make('App\RuneTime\Accounts\RoleRepository');
        $role = $roles->getById($important->role_id);

        return $role;
    }

    /**
     * @param $allowedRole
     *
     * @return bool
     */
    private function roleCollectionHasRole($allowedRole)
    {
        $roles = $this->getRoles();
        if (!$roles) {
            return false;
        }

        foreach ($roles as $role) {
            if (strtolower($role->name) == strtolower($allowedRole)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param $name
     */
    public function setRole($name)
    {
        $role = \App::make('App\RuneTime\Accounts\RoleRepository')->
            getByName($name);
        $assigned_roles = [];
        if ($role) {
            $assigned_roles[] = $role->id;
        }

        $this->roles()->attach($assigned_roles);
    }

    /**
     * @param Role $role
     */
    public function roleRemove(Role $role)
    {
        $roles = \App::make('App\RuneTime\Accounts\UserRoleRepository');
        $role = $roles->selectByUserAndRole($this->id, $role->id);
        $role->delete();
    }

    /**
     * @param Role $role
     * @param bool $important
     */
    public function roleAdd(Role $role, $important = false)
    {
        with(new UserRole)->saveNew($this->id, $role->id, $important);
    }

    /**
     * @return bool
     */
    public function isStaff()
    {
        return $this->hasOneOfRoles(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13);
    }

    /**
     * @return bool
     */
    public function isLeader()
    {
        return $this->hasOneOfRoles(1, 2, 4, 6, 8, 10, 12);
    }

    /**
     * @return bool
     */
    public function isAdmin()
    {
        return $this->hasOneOfRoles(1);
    }

    /**
     * @return bool
     */
    public function isRadio()
    {
        return $this->hasOneOfRoles(1, 2, 3);
    }

    /**
     * @return bool
     */
    public function isMedia()
    {
        return $this->hasOneOfRoles(1, 4, 5);
    }

    /**
     * @return bool
     */
    public function isDeveloper()
    {
        return $this->hasOneOfRoles(1, 6, 7);
    }

    /**
     * @return bool
     */
    public function isCommunity()
    {
        return $this->hasOneOfRoles(1, 10, 11);
    }

    /**
     * @return bool
     */
    public function isEvents()
    {
        return $this->hasOneOfRoles(1, 12, 13);
    }

    /**
     * @return int
     */
    public function incrementPostTotal()
    {
        return $this->increment('posts_total');
    }

    /**
     *
     */
    public function incrementPostActive()
    {
        $rank = $this->rank;
        $rankRepository = new RankRepository(new Rank);

        $this->increment('posts_total');
        $this->increment('posts_active');

        $rankAtPosts = $rankRepository->getByPostCount($this->posts_active);
        if ($rankAtPosts->id !== $rank->id) {
            $this->rank_id = $rankAtPosts->id;
        }

        $this->save();
    }

    /**
     * @return int
     */
    public function incrementProfileViews()
    {
        return $this->increment('profile_views');
    }

    /**
     * UserInterface
     */
    public function getAuthIdentifier()
    {
        return $this->getKey();
    }

    /**
     * @return mixed
     */
    public function getAuthPassword()
    {
        return $this->password;
    }

    /**
     * RemindableInterface
     */
    public function getReminderEmail()
    {
        return $this->email;
    }

    /**
     * @return mixed
     */
    public function getRememberToken()
    {
        return $this->remember_token;
    }

    /**
     * @param string $newValue
     */
    public function setRememberToken($newValue)
    {
        $this->remember_token = $newValue;
    }

    /**
     * @return string
     */
    public function getRememberTokenName()
    {
        return 'remember_token';
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function threads()
    {
        return $this->hasMany('App\RuneTime\Forum\Threads\Thread', 'author_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function checkups()
    {
        return $this->belongsToMany('App\RuneTime\Checkup\Checkup');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function messages()
    {
        return $this->belongsToMany('App\RuneTime\Messenger\Message');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function tickets()
    {
        return $this->belongsToMany('App\RuneTime\Tickets\Ticket');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function referredBy()
    {
        return $this->belongsTo('App\RuneTime\Accounts\User', 'referred_by');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function rank()
    {
        return $this->belongsTo('App\RuneTime\Accounts\Rank', 'rank_id');
    }

    /**
     *
     */
    public function incrementReputation()
    {
        $this->increment('reputation');
    }

    /**
     *
     */
    public function decrementReputation()
    {
        $this->decrement('reputation');
    }

    /**
     * @param $amount
     */
    public function reputationChange($amount)
    {
        $this->increment('reputation', $amount);
    }

    /**
     * @param string $path
     *
     * @return string
     */
    public function toSlug($path = '')
    {
        return url('profile/' . \String::slugEncode($this->id, $this->display_name) . (!empty($path) ? '/' . $path : ''));
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function awards()
    {
        return $this->hasMany('App\RuneTime\Awards\Awardee', 'user_id');
    }

    /**
     * @return null|string
     */
    public function status()
    {
        if ($this->cacheStatus !== null) {
            return $this->cacheStatus;
        }

        $lastOnline = time() - $this->last_active;

        if ($lastOnline > 60 * 30) { // 30 minutes
            $this->cacheStatus = 'offline';
        } elseif ($lastOnline > 60 * 5) { // 5 minutes
            $this->cacheStatus = 'away';
        } else {
            $this->cacheStatus = 'online';
        }

        return $this->cacheStatus;
    }

    /**
     * @return bool|string
     */
    public function hasImage()
    {
        $path = '/img/forums/photos/' . $this->id . '.png';

        if (file_exists($path) && filesize($path) > 50) {
            return $path;
        }

        return false;
    }
}
