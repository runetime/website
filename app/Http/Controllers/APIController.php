<?php
namespace App\Http\Controllers;

use App\Http\Requests\API\UserRequest;
use App\RuneTime\Accounts\UserRepository;
use App\RuneTime\Awards\Award;
use App\RuneTime\Awards\AwardRepository;

/**
 * Class APIController
 */
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
     * Returns all of the awards' id and name.
     *
     * @return string
     */
    public function getAwards()
    {
        $awards = $this->awards->getByStatus(Award::STATUS_AVAILABLE);

        $response = [];

        foreach ($awards as $award) {
            $response[] = (object) [
                'id'   => $award->id,
                'name' => $award->name,
            ];
        }

        return json_encode($response);
    }

    /**
     * Returns basic non-sensitive information about a user,
     * posted over a REST API, giving the user's ID.
     *
     * @param UserRequest $form
     *
     * @return \Illuminate\View\View
     */
    public function postUser(UserRequest $form)
    {
        $user = $this->users->getById($form->id);

        return json_encode([
            'id'               => $user->id,
            'display_name'     => $user->display_name,
            'title'            => $user->title,
            'about'            => $user->about,
            'about_parsed'     => $user->about_parsed,
            'signature'        => $user->signature,
            'signature_parsed' => $user->signature_parsed,
            'posts_active'     => $user->posts_active,
            'posts_total'      => $user->posts_total,
            'profile_views'    => $user->profile_views,
            'reputation'       => $user->reputation,
        ]);
    }
}
