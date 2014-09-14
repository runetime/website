<?php
namespace Runis\Accounts;
class UserCreator{
	protected $users;
	public function __construct(UserRepository $users){
		$this->users=$users;
	}
	public function create(UserCreatorListener $observer,$data,$validator=null){
		if($validator&&!$validator->isValid()){
			return $observer->userValidationError($validator->getErrors());
		}
		return $this->createValidUserRecord($observer,$data);
	}
	private function createValidUserRecord($observer,$data){
		$user=$this->users->getNew($data);
		if(!$this->users->save($user)){
			return $observer->userValidationError($user->getErrors());
		}
		return $observer->userCreated($user);
	}
}