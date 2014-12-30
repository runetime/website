<?php
namespace App\Http\Controllers;

use App\Http\Requests\API\UserRequest;
use App\RuneTime\Awards\Award;
use App\RuneTime\Awards\AwardRepository;
use App\RuneTime\Accounts\UserRepository;

class APIController extends Controller
{
	/**
	 * @var AwardRepository
	 */
	private $awards;
	/**
	 * @var UserRepository
	 */
	private $users;

	/**
	 * @param AwardRepository $awards
	 * @param UserRepository  $users
	 */
	public function __construct(AwardRepository $awards, UserRepository $users)
	{
		$this->awards = $awards;
		$this->users = $users;
	}

	/**
	 * @return string
	 */
	public function getAwards()
	{
		$response = [];
		$awards = $this->awards->getByStatus(Award::STATUS_AVAILABLE);
		foreach($awards as $award) {
			$set = (object) [
				'id'   => $award->id,
				'name' => $award->name,
			];
			array_push($response, $set);
		}

		return json_encode($response);
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