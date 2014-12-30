<?php
namespace App\Http\Controllers;

use App\Http\Requests\Staff\CheckupRequest;
use App\Http\Requests\Staff\UserMuteRequest;
use App\Http\Requests\Staff\UserReportRequest;
use App\RuneTime\Bans\Mute;
use App\RuneTime\Checkup\CheckupRepository;
use App\RuneTime\Checkup\Checkup;
use App\RuneTime\Forum\Threads\Post;
use App\RuneTime\Tickets\Ticket;
use App\RuneTime\Accounts\RoleRepository;
use App\RuneTime\Accounts\UserRepository;

class StaffController extends BaseController
{
	/**
	 * @var CheckupRepository
	 */
	private $checkups;
	/**
	 * @var RoleRepository
	 */
	private $roles;
	/**
	 * @var UserRepository
	 */
	private $users;

	/**
	 * @param CheckupRepository $checkups
	 * @param RoleRepository    $roles
	 * @param UserRepository    $users
	 */
	public function __construct(CheckupRepository $checkups, RoleRepository $roles, UserRepository $users)
	{
		$this->checkups = $checkups;
		$this->roles = $roles;
		$this->users = $users;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$this->nav('navbar.staff.title');
		$this->title('staff.index.title');

		return $this->view('staff.index');
	}

	/**
	 * @param UserReportRequest $form
	 *
	 * @return string
	 */
	public function postUserReport(UserReportRequest $form)
	{
		$response = ['done' => true];
		$user = $this->users->getByDisplayName($form->username);
		if(!empty($user)) {
			$contentsParsed = with(new \Parsedown)->text($form->contents);
			$ticket = with(new Ticket)->saveNew(\Auth::user()->id, $user->display_name . " reported by " . \Auth::user()->display_name, 0, 0, Ticket::STATUS_ESCALATED);
			$post = with(new Post)->saveNew(\Auth::user()->id, 0, Post::STATUS_VISIBLE, \String::encodeIP(), $form->contents, $contentsParsed);
			$ticket->last_post = $post->id;
			$ticket->save();
			$ticket->addPost($post);
			if(!$ticket || !$post) {
				$response['error'] = -2;
			}
		} else {
			$response['done'] = false;
			$response['error'] = -1;
		}

		return json_encode($response);
	}

	/**
	 * @param UserMuteRequest $form
	 *
	 * @return string
	 */
	public function postUserMute(UserMuteRequest $form)
	{
		$response = ['done' => false];
		$user = $this->users->getByDisplayName($form->username);
		if(!empty($user)) {
			$contentsParsed = with(new \Parsedown)->text($form->contents);
			$mute = with(new Mute)->saveNew(\Auth::user()->id, $user->id, $form->contents, $contentsParsed, time(), \Carbon::now()->addHour()->timestamp);
			if(!empty($mute)) {
				$response['done'] = true;
			} else {
				$response['error'] = -2;
			}
		} else {
			$response['error'] = -1;
		}

		return json_encode($response);
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getCheckup()
	{
		$date = \Time::long(\Carbon::now());

		$this->bc(['staff' => trans('staff.title')]);
		$this->nav('navbar.staff.title');
		$this->title('staff.checkup.title');
		return $this->view('staff.checkup.form', compact('date'));
	}

	/**
	 * @param CheckupRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postCheckup(CheckupRequest $form)
	{
		$hoursActive = with(new \Parsedown)->text($form->hours_active);
		$checkup = with(new Checkup)->saveNew($form->active, $hoursActive, $form->team);
		$checkup->addAuthor(\Auth::user());

		return \redirect()->to('staff');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getList()
	{
		$admins = $this->roles->getUsersById(1);
		$radio = $this->roles->getUsersById(2, 3);
		$media = $this->roles->getUsersById(4, 5);
		$webDev = $this->roles->getUsersById(6, 7);
		$content = $this->roles->getUsersById(8, 9);
		$community = $this->roles->getUsersById(10, 11);
		$events = $this->roles->getUsersById(12, 13);

		$this->nav('navbar.runetime.title');
		$this->title('staff.list.title');
		return $this->view('staff.list', compact('admins', 'radio', 'media', 'webDev', 'content', 'community', 'events'));
	}
}