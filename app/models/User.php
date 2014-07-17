<?php
use Illuminate\Auth\UserInterface;
use Illuminate\Auth\Reminders\RemindableInterface;
class User extends Eloquent implements UserInterface,RemindableInterface{
	public static $email="";
	public static $gid=-1;
	public static $logged=false;
	/**
	* Get the unique identifier for the user.
	*
	* @return mixed
	*/
	public function getAuthIdentifier(){
		return $this->getKey();
	}

	/**
	* Get the password for the user.
	*
	* @return string
	*/
	public function getAuthPassword(){
		return $this->password;
	}
	/**
	 * Sets the static information regarding the user's account
	 */
	public static function login(){
		if(Auth::check()){
			self::$email=Auth::user()->email;
			self::$logged=true;
		}
	}
	/**
	* Get the e-mail address where password reminders are sent.
	*
	* @return string
	*/
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