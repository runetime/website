<?php
namespace App\Runis\Accounts;
interface UserCreatorListener{
	public function userValidationError($errors);
	public function userCreated($user);
}