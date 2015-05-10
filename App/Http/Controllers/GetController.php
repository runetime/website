<?php
namespace App\Http\Controllers;

use App\RuneTime\Accounts\UserRepository;
use Illuminate\Http\Request;

/**
 * Class GetController
 * @package App\Http\Controllers
 */
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
	 * Checks to see if an email address has already been used on the site.
	 *
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
	 * Checks to see if a display name has already been used on the site.
	 *
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
	 * Returns a JSON string of a RuneScape Name's hiscores.
	 *
	 * @param $rsn
	 *
	 * @return string
	 */
	public function getHiscore($rsn)
	{
		return json_encode(\String::getHiscore($rsn));
	}
}