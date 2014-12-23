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
	public function __construct(UserRepository $users)
	{
		$this->users = $users;
	}
	
	/**
	 * @param UserRequest $form
	 *
	 * @return \Illuminate\View\View
	 */
	public function postUser(UserRequest $form)
	{
		$u = $this->users->getById($form->id);

		$user = (object) [
			'id'               => $u->id,
			'display_name'     => $u->display_name,
			'title'            => $u->title,
			'about'            => $u->about,
			'about_parsed'     => $u->about_parsed,
			'signature'        => $u->signature,
			'signature_parsed' => $u->signature_parsed,
			'posts_active'     => $u->posts_active,
			'posts_total'      => $u->posts_total,
			'profile_views'    => $u->profile_views,
			'reputation'       => $u->reputation,
		];

		return json_encode($user);
	}
}