<?php
namespace App\Http\Controllers;
use App\Http\Requests\Staff\CheckupRequest;
use App\RuneTime\Checkup\CheckupRepository;
use App\RuneTime\Forum\Reports\ReportRepository;
use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Forum\Threads\ThreadRepository;
use App\RuneTime\Checkup\Checkup;
use App\RuneTime\Radio\HistoryRepository;
use App\RuneTime\Radio\MessageRepository;
use App\RuneTime\Radio\SessionRepository;
use App\RuneTime\Radio\TimetableRepository;
use App\Runis\Accounts\RoleRepository;
use App\Runis\Accounts\UserRepository;
/**
 * Class StaffController
 * @package App\Http\Controllers
 */
class StaffController extends BaseController {
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
	public function getIndex() {
		$this->nav('Staff Panel');
		$this->title('Staff Panel');
		return $this->view('staff.index');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getCheckup() {
		$date = \Time::long(time());
		$this->bc(['staff' => 'Staff']);
		$this->nav('navbar.staff.staff');
		$this->title('Staff Checkup');
		return $this->view('staff.checkup.form', compact('date'));
	}

	/**
	 * @param CheckupRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postCheckup(CheckupRequest $form) {
		$checkup = new Checkup;
		$hoursActive = with(new \Parsedown)->text($form->hours_active);
		$checkup = $checkup->saveNew($form->active, $hoursActive, $form->team);
		$checkup->addAuthor(\Auth::user());
		return \redirect()->to('staff');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getCheckupList() {
		$checkups = $this->checkups->getX(30);
		$this->bc(['staff' => 'Staff', 'staff/checkup' => 'Checkup']);
		$this->nav('navbar.staff.staff');
		$this->title('Staff Checkup');
		return $this->view('staff.checkup.list', compact('checkups'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getCheckupView($id) {
		$checkup = $this->checkups->getById($id);
		$displayName = $this->users->getById($checkup->author()->first()->id);
		$displayName = $displayName->display_name;
		$this->bc(['staff' => 'Staff', 'staff/checkup' => 'Checkups']);
		$this->nav('navbar.staff.staff');
		$this->title('Checkup by ' . $displayName);
		return $this->view('staff.checkup.view', compact('checkup', 'displayName'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getList() {
		$admins = $this->roles->getUsersById(1);
		$radio = $this->roles->getUsersById(2, 3);
		$media = $this->roles->getUsersById(4, 5);
		$webDev = $this->roles->getUsersById(6, 7);
		$content = $this->roles->getUsersById(8, 9);
		$community = $this->roles->getUsersById(10, 11);
		$events = $this->roles->getUsersById(12, 13);
		$this->nav('RuneTime');
		$this->title('Staff Team');
		return $this->view('staff.list', compact('admins', 'radio', 'media', 'webDev', 'content', 'community', 'events'));
	}
}