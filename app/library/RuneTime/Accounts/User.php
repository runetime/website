<?php
namespace RT\Accounts;
use Eloquent;
use Illuminate\Auth\UserInterface;
use Illuminate\Auth\Reminders\RemindableInterface;
use RT\Core\Entity;
class User extends Entity implements UserInterface,RemindableInterface{
	const STATE_ACTIVE=1;
	const STATE_BLOCKED=2;

	protected $table='users';
	protected $hidden=[];
	protected $fillable=['email','name'];
	protected $softDelete=true;

	public $presenter='RT\Accounts\UserPresenter';

	protected $validationRules=[
	];
	private $rolesCache;
	public function getRole(){

	}
	public function getAuthIdentifier(){
		return $this->getKey();
	}
	public function getAuthPassword(){
		return $this->password;
	}
	public function getReminderEmail(){
		return $this->email;
	}
	public function getRememberToken(){
		return $this->remember_token;
	}
	public function setRememberToken($value){
		$this->remember_token=$value;
	}
	public function getRememberTokenName(){
		return 'remember_token';
	}
}