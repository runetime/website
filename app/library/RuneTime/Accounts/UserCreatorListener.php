<?php
namespace RT\Accounts;
interface UserCreatorListener{
	public function userValidationError($errors);
	public function userCreated($user);
}