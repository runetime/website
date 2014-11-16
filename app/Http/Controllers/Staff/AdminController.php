<?php
namespace App\Http\Controllers;
use App\RuneTime\Checkup\CheckupRepository;
use App\RuneTime\Forum\Reports\ReportRepository;
use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Forum\Threads\ThreadRepository;
use App\RuneTime\Radio\HistoryRepository;
use App\RuneTime\Radio\MessageRepository;
use App\RuneTime\Radio\SessionRepository;
use App\RuneTime\Radio\TimetableRepository;
use App\Runis\Accounts\RoleRepository;
use App\Runis\Accounts\UserRepository;
class StaffAdminController extends BaseController {
	/**
	 * @var ReportRepository
	 */
	private $reports;
	/**
	 * @var RoleRepository
	 */
	private $roles;
	/**
	 * @var UserRepository
	 */
	private $users;
	/**
	 * @var ThreadRepository
	 */
	private $threads;
	/**
	 * @var PostRepository
	 */
	private $posts;
	/**
	 * @var CheckupRepository
	 */
	private $checkups;
	/**
	 * @var MessageRepository
	 */
	private $messages;
	/**
	 * @var TimetableRepository
	 */
	private $timetable;
	/**
	 * @var SessionRepository
	 */
	private $sessions;
	/**
	 * @var HistoryRepository
	 */
	private $history;

	/**
	 * @param CheckupRepository   $checkups
	 * @param HistoryRepository   $history
	 * @param MessageRepository   $messages
	 * @param PostRepository      $posts
	 * @param ReportRepository    $reports
	 * @param RoleRepository      $roles
	 * @param SessionRepository   $sessions
	 * @param ThreadRepository    $threads
	 * @param TimetableRepository $timetable
	 * @param UserRepository      $users
	 */
	public function __construct(CheckupRepository $checkups, HistoryRepository $history, MessageRepository $messages, PostRepository $posts, ReportRepository $reports, RoleRepository $roles, SessionRepository $sessions, ThreadRepository $threads, TimetableRepository $timetable, UserRepository $users) {
		$this->reports = $reports;
		$this->roles = $roles;
		$this->users = $users;
		$this->threads = $threads;
		$this->posts = $posts;
		$this->checkups = $checkups;
		$this->messages = $messages;
		$this->timetable = $timetable;
		$this->sessions = $sessions;
		$this->history = $history;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getAdministratorIndex() {
		$this->bc(['staff' => 'Staff']);
		$this->nav('navbar.staff.staff');
		$this->title('Administrator Panel');
		return $this->view('staff.administrator.index');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getAdministratorUsers() {
		$this->bc(['staff' => 'Staff', 'staff/administrator' => 'Administrator Panel']);
		$this->nav('navbar.staff.staff');
		$this->title('User Management');
		return $this->view('staff.administrator.users');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getAdministratorIPBan() {
		$this->bc(['staff' => 'Staff', 'staff/administrator' => 'Administrator Panel']);
		$this->nav('navbar.staff.staff');
		$this->title('IP Banning');
		return $this->view('staff.administrator.ip');
	}

	/**
	 * @param IPBanRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postAdministratorIPBan(IPBanRequest $form) {
		return \redirect()->to('staff/administrator/ip-ban');
	}
}