<?php
namespace App\Http\Controllers;

use App\Http\Requests\API\UserRequest;
use App\Runis\Accounts\UserRepository;

class APIController extends BaseController
{
	/**
	 * @var UserRepository
	 */
	private $users;

	/**
	 * @param UserRepository $users
	 */
	public function __construct(UserRepository $users) {
		$this->users = $users;
	}
	/**
	 * @param UserRequest $form
	 *
	 * @return \Illuminate\View\View
	 */
	public function postUser(UserRequest $form)
	{
		$user = $this->users->getById($form->id);

		return json_encode($user);
	}
}