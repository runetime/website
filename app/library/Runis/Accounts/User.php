<?php
namespace Runis\Accounts;
use Eloquent;
use Illuminate\Auth\UserInterface;
use Illuminate\Auth\Reminders\RemindableInterface;
use Runis\Core\Entity;
class User extends Entity implements UserInterface,RemindableInterface{
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
		return $this->belongsToMany('RT\Accounts\Role');
	}
	public function getRoles(){
		if(!isset($this->rolesCache)){
			$this->rolesCache=$this->roles;
		}
		return $this->rolesCache;
	}
	public function hasRole($roleName){
		return $this->hasRoles($roleName);
	}
	public function hasRoles($roleNames=[]){
		$roleList=\App::make('RT\Accounts\RoleRepository')->
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
}