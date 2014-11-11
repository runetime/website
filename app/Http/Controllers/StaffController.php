<?php
namespace App\Http\Controllers;
use App\Http\Requests\Staff\RadioMessageRequest;
use App\Http\Requests\Staff\RadioTimetableRequest;
use App\Http\Requests\Staff\CheckupRequest;
use App\Http\Requests\Staff\ModerationThreadTitleRequest;
use App\Http\Requests\Staff\RadioLiveRequest;
use App\RuneTime\Checkup\CheckupRepository;
use App\RuneTime\Forum\Reports\Report;
use App\RuneTime\Forum\Reports\ReportRepository;
use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Forum\Threads\ThreadRepository;
use App\RuneTime\Checkup\Checkup;
use App\RuneTime\Radio\Message;
use App\RuneTime\Radio\MessageRepository;
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
	 * @param CheckupRepository $checkups
	 * @param MessageRepository $messages
	 * @param PostRepository    $posts
	 * @param ReportRepository  $reports
	 * @param RoleRepository    $roles
	 * @param ThreadRepository  $threads
	 * @param UserRepository    $users
	 */
	public function __construct(CheckupRepository $checkups, MessageRepository $messages, PostRepository $posts, ReportRepository $reports, RoleRepository $roles, ThreadRepository $threads,UserRepository $users) {
		$this->reports = $reports;
		$this->roles = $roles;
		$this->users = $users;
		$this->threads = $threads;
		$this->posts = $posts;
		$this->checkups = $checkups;
		$this->messages = $messages;
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
		$this->nav('Staff');
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
		$this->nav('Staff');
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
		$this->nav('Staff');
		$this->title('Checkup by ' . $displayName);
		return $this->view('staff.checkup.view', compact('checkup', 'displayName'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getModerationIndex() {
		$reports = $this->reports->getByStatus(Report::STATUS_OPEN);
		$reportList = [];
		foreach($reports as $report) {
			$report->type=$this->reports->convertType($report->type);
			$report->post = $this->posts->getByid($report->reported_id);
			$report->reportee = $this->users->getById($report->author_id);
			$report->thread = $this->threads->getById($report->post->thread);
			array_push($reportList, $report);
		}
		$this->nav('Staff');
		$this->title('Moderation Centre');
		return $this->view('staff.moderation.index', compact('reportList'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getModerationReportView($id) {
		$report = $this->reports->getById($id);
		if(!$report)
			\App::abort(404);
		$author = $this->users->getByid($report->author_id);
		$post = $this->posts->getById($report->reported_id);
		$thread = $this->threads->getById($post->thread);
		$status = $report->getStatus();
		$this->nav('Staff');
		$this->title('Viewing Report # ' . $report->id);
		return $this->view('staff.moderation.report.view', compact('report', 'author', 'post', 'thread', 'status'));
	}

	/**
	 * @param $id
	 * @param $name
	 * @param $status
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function getModerationThreadStatus($id, $name, $status) {
		$thread = $this->threads->getById($id);
		if(!$thread)
			\App::abort(404);
		$thread->status = $status;
		$thread->save();
		return \redirect()->to('/forums/thread/' . \String::slugEncode($thread->id, $thread->title));
	}

	/**
	 * @param $id
	 *
	 * @internal param $name
	 * @internal param $status
	 *
	 * @return \Illuminate\View\View
	 */
	public function getModerationThreadTitle($id) {
		$thread = $this->threads->getById($id);
		if(!$thread)
			\App::abort(404);
		$this->nav('Staff');
		$this->title('Editing Thread Title');
		return $this->view('staff.moderation.thread.title', compact('thread'));
	}

	/**
	 * @param ModerationThreadTitleRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postModerationThreadTitle(ModerationThreadTitleRequest $form) {
		$thread = $this->threads->getById($form->id);
		if(!$thread)
			\App::abort(404);
		$thread->title = $form->title;
		$thread->save();
		return \redirect()->to('/forums/thread/' . \String::slugEncode($thread->id, $thread->title));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getRadioIndex() {
		$live = \Cache::get('radio.dj.current');
		if($live)
			$live = $this->users->getById($live);
		$messages = $this->messages->getByUser(\Auth::user()->id);
		$this->bc(['staff' => 'Staff']);
		$this->nav('navbar.staff.staff');
		$this->title('Radio Panel');
		return $this->view('staff.radio.index', compact('live', 'messages'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getRadioLive() {
		$this->bc(['staff' => 'Staff', 'staff/radio' => 'Radio Panel']);
		$this->nav('navbar.staff.staff');
		$this->title('Radio Center');
		return $this->view('staff.radio.live');
	}

	public function postRadioLive(RadioLiveRequest $form) {
		if($form->live !== "go")
			return \App::abort(404);
		$live = \Cache::get('radio.dj.current');
		if(!$live)
			\Cache::forever('radio.dj.current', \Auth::user()->id);
		return \redirect()->to('/staff/radio/live');
	}

	public function getRadioLiveStop() {
		$live = \Cache::get('radio.dj.current');
		if($live)
			if($live === \Auth::user()->id)
				\Cache::forever('radio.dj.current', null);
		return \redirect()->to('/staff/radio');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getRadioMessages() {
		$messages = $this->messages->getByUser(\Auth::user()->id);
		$this->bc(['staff' => 'Staff', 'staff/radio' => 'Radio Panel']);
		$this->nav('navbar.staff.staff');
		$this->title('Radio Messages');
		return $this->view('staff.radio.messages', compact('messages'));
	}

	/**
	 * @param RadioMessageRequest $form
	 *
	 * @return string
	 */
	public function postRadioMessages(RadioMessageRequest $form) {
		$contentsParsed = with(new \Parsedown)->text($form->contents);
		$message = new Message;
		$message->saveNew(\Auth::user()->id, $form->contents, $contentsParsed);
		return \redirect()->to('/staff/radio/messages');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getRadioTimetable() {
		$this->bc(['staff' => 'Staff', 'staff/radio' => 'Radio Panel']);
		$this->nav('navbar.staff.staff');
		$this->title('Radio Timetable');
		return $this->view('staff.radio.timetable');
	}

	/**
	 * @param RadioTimetableRequest $form
	 *
	 * @return string
	 */
	public function postRadioTimetable(RadioTimetableRequest $form) {
		header('Content-Type: application/json');
		$response = ['valid' => true];
		return json_encode($response);
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