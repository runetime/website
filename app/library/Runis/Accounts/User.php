<?php
namespace Runis\Accounts;
use Eloquent;
use Illuminate\Auth\Reminders\RemindableTrait;
use Illuminate\Auth\UserInterface;
use Illuminate\Auth\Reminders\RemindableInterface;
use Illuminate\Auth\UserTrait;
use Illuminate\Database\Eloquent\SoftDeletingTrait;
use McCool\LaravelAutoPresenter\PresenterInterface;
use Runis\Core\Entity;
class User extends Entity implements UserInterface,RemindableInterface,PresenterInterface{
	use UserTrait, RemindableTrait, SoftDeletingTrait;
	const STATE_ACTIVE=1;
	const STATE_BLOCKED=2;
	protected $table='users';
	protected $hidden=[];
	protected $fillable=['email','name'];
	protected $softDelete=true;
	public $presenter='Runis\Accounts\UserPresenter';
	protected $validationRules=[
	];
	private $rolesCache;
	public function roles(){
		return $this->belongsToMany('Runis\Accounts\Role');
	}
	public function getRoles(){
		if(!isset($this->rolesCache)){
			$this->rolesCache=$this->roles;
		}
		return $this->rolesCache;
	}
	public function hasRole($roleName){
		return in_array($roleName,array_fetch($this->roles->toArray(),'name'));
	}
	public function hasRoles($roleNames=[]){
		$roleList=\App::make('Runis\Accounts\RoleRepository')->
			getRoleList();
		foreach((array)$roleNames as $allowedRole){
			if(!in_array($allowedRole,$roleList)){
				throw new InvalidRoleException("Unidentified role: ".$allowedRole);
			}
			if(!$this->roleCollectionHasRole($allowedRole)){
				return false;
			}
		}
		return true;
	}
	public function hasOneOfRoles(){
		foreach(func_get_args() as $role)
			if(in_array($role,array_fetch($this->roles->toArray(),'id')))
				return true;
		return false;
	}
	public function importantRole(){
		$roles=$this->getRoles();
		return $roles[rand(0,count($roles)-1)];
	}
	private function roleCollectionHasRole($allowedRole){
		$roles=$this->getRoles();
		if(!$roles){
			return false;
		}
		foreach($roles as $role){
			if(strtolower($role->name)==strtolower($allowedRole)){
				return true;
			}
		}
		return false;
	}
	public function setRole($name){
		$role=\App::make('Runis\Accounts\RoleRepository')->
			getByName($name);
		$assigned_roles=[];
		if($role)
			$assigned_roles[]=$role->id;
		$this->roles()->attach($assigned_roles);
	}
	public function isStaff(){
		return $this->hasOneOfRoles(1,2,4,6,8,10,12);
	}
	/**
	 * UserInterface
	 */
	public function getAuthIdentifier(){
		return $this->getKey();
	}
	public function getAuthPassword(){
		return $this->password;
	}
	/**
	 * RemindableInterface
	 */
	public function getReminderEmail(){
		return $this->email;
	}
	public function getRememberToken(){
		return $this->remember_token;
	}
	public function setRememberToken($newValue){
		$this->remember_token=$newValue;
	}
	public function getRememberTokenName(){
		return 'remember_token';
	}
    /**
	* Get the presenter class.
	*
	* @return string The class path to the presenter.
	*/
	public function getPresenter(){
		return 'Runis\Accounts\UserPresenter';
	}
}