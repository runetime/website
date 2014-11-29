<?php
namespace App\Http\Controllers;
use App\Runis\Accounts\UserRepository;
use Illuminate\Http\Request;
class GetController extends BaseController {
	/**
	 * @var UserRepository
	 */
	private $users;

	/**
	 * @param UserRepository   $users
	 */
	public function __construct(UserRepository $users) {
		$this->users = $users;
	}

	/**
	 * @param Request $form
	 *
	 * @return string
	 */
	public function postEmail(Request $form) {
		$available = true;
		if($this->users->getByEmail($form->email))
			$available = false;
		return json_encode(['available' => $available]);
	}

	/**
	 * @param Request $form
	 *
	 * @return string
	 */
	public function postDisplayName(Request $form) {
		$available = true;
		if($this->users->getByDisplayName($form->display_name) || $this->users->getByDisplayName($form->display_name))
			$available = false;
		return json_encode(['available' => $available]);
	}

	/**
	 * @param $rsn
	 *
	 * @return string
	 */
	public function getHiscore($rsn) {
		return json_encode(\String::getHiscore($rsn));
	}
}