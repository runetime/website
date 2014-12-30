<?php
namespace App\Http\Controllers;

use App\RuneTime\Accounts\UserRepository;
use Illuminate\Http\Request;

class GetController extends Controller
{
	/**
	 * @var UserRepository
	 */
	private $users;

	/**
	 * @param UserRepository   $users
	 */
	public function __construct(UserRepository $users)
	{
		$this->users = $users;
	}

	/**
	 * @param Request $form
	 *
	 * @return string
	 */
	public function postEmail(Request $form)
	{
		$available = true;
		$user = $this->users->getByEmail($form->email);
		if(!empty($user)) {
			$available = false;
		}

		return json_encode(['available' => $available]);
	}

	/**
	 * @param Request $form
	 *
	 * @return string
	 */
	public function postDisplayName(Request $form)
	{
		$available = true;
		$user = $this->users->getByDisplayName($form->display_name);
		if(!empty($user)) {
			$available = false;
		}

		return json_encode(['available' => $available]);
	}

	/**
	 * @param $rsn
	 *
	 * @return string
	 */
	public function getHiscore($rsn)
	{
		return json_encode(\String::getHiscore($rsn));
	}
}