<?php
namespace App\Http\Controllers;

use App\Http\Requests\Staff\LeaderDemoteStaffRequest;
use App\Http\Requests\Staff\LeaderMuteUserRequest;
use App\Http\Requests\Staff\LeaderTempBanRequest;
use App\RuneTime\Accounts\RoleRepository;
use App\RuneTime\Accounts\UserRepository;
use App\RuneTime\Accounts\UserRoleRepository;
use App\RuneTime\Bans\Ban;
use App\RuneTime\Bans\Mute;
use App\RuneTime\Chat\Chat;
use App\RuneTime\Chat\ChatRepository;

/**
 * Class StaffTeamLeaderController
 */
final class StaffTeamLeaderController extends Controller
{
    /**
     * @var ChatRepository
     */
    private $chats;
    /**
     * @var RoleRepository
     */
    private $roles;
    /**
     * @var UserRepository
     */
    private $users;
    /**
     * @var UserRoleRepository
     */
    private $userRoles;

    /**
     * @param ChatRepository     $chats
     * @param RoleRepository     $roles
     * @param UserRepository     $users
     * @param UserRoleRepository $userRoles
     */
    public function __construct(ChatRepository $chats, RoleRepository $roles, UserRepository $users, UserRoleRepository $userRoles)
    {
        $this->chats = $chats;
        $this->roles = $roles;
        $this->users = $users;
        $this->userRoles = $userRoles;
    }

    /**
     * @return \Illuminate\View\View
     */
    public function getIndex()
    {
        $roleId = \Auth::user()->importantRole()->id + 1;
        $members = $this->userRoles->getByRole($roleId);

        $this->bc(['staff' => trans('staff.title')]);
        $this->nav('navbar.staff.team_leader');
        $this->title('staff.team_leader.title');

        return $this->view('staff.team_leader.index', compact('members'));
    }

    /**
     * @param LeaderDemoteStaffRequest $form
     *
     * @return string
     */
    public function postDemote(LeaderDemoteStaffRequest $form)
    {
        $response = ['done' => false];
        $user = $this->users->getById($form->id);
        if (\Auth::user()->isLeader()) {
            if ($user->importantRole()->id - 1 === \Auth::user()->importantRole()->id) {
                $newRole = $this->roles->getByName('Members');
                $user->roleRemove($user->importantRole());
                $user->roleAdd($newRole, true);
                $response['done'] = true;
                $response['name'] = $user->display_name;
            } else {
                $response['error'] = -2;
            }
        } else {
            $response['error'] = -1;
        }

        return json_encode($response);
    }

    /**
     * @param LeaderTempBanRequest $form
     *
     * @return string
     */
    public function postTempBan(LeaderTempBanRequest $form)
    {
        $response = ['done' => false];
        $user = $this->users->getByDisplayName($form->username);
        if (!empty($user)) {
            $ban = with(new Ban)->saveNew(\Auth::user()->id, $user->id, $form->reason,
                \Carbon::now()->addDays(3)->timestamp);
            if (!empty($ban)) {
                $response['done'] = true;
                $response['name'] = $user->display_name;
            } else {
                $response['error'] = -2;
            }
        } else {
            $response['error'] = -1;
        }

        return json_encode($response);
    }

    /**
     * @param LeaderMuteUserRequest $form
     *
     * @return string
     */
    public function postMuteUser(LeaderMuteUserRequest $form)
    {
        $response = ['done' => false];
        $user = $this->users->getByDisplayName($form->username);
        if (!empty($user)) {
            if (ctype_digit($form->time)) {
                $hours = (int) $form->time;
            } else {
                if ($form->time === 'infinite') {
                    $hours = 42000;
                } else {
                    return json_encode([
                        'done'  => false,
                        'error' => -3,
                    ]);
                }
            }

            $contentsParsed = with(new \Parsedown)->text($form->reason);
            $mute = with(new Mute)->saveNew(\Auth::user()->id, $user->id, $form->reason, $contentsParsed, time(), \Carbon::now()->addHours($hours)->timestamp);
            if (!empty($mute)) {
                $response['done'] = true;
                $response['name'] = $user->display_name;
            } else {
                $response['error'] = -2;
            }
        } else {
            $response['error'] = -1;
        }

        return json_encode($response);
    }

    /**
     * @return string
     */
    public function postClearChatbox()
    {
        $response = ['done' => false];
        $this->chats->setAllInvisible(true);
        $chat = $this->chats->getLatest();
        if ($chat->status === Chat::STATUS_INVISIBLE) {
            $response['done'] = true;
        } else {
            $response['error'] = -1;
        }

        return json_encode($response);
    }
}
