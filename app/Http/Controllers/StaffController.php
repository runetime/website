<?php
namespace App\Http\Controllers;
use App\Http\Requests\StaffModerationThreadTitleForm;
use App\RuneTime\Forum\Reports\Report;
use App\RuneTime\Forum\Reports\ReportRepository;
use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Forum\Threads\ThreadRepository;
use App\Runis\Accounts\RoleRepository;
use App\Runis\Accounts\UserRepository;
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
	 * @param PostRepository   $posts
	 * @param ReportRepository $reports
	 * @param RoleRepository   $roles
	 * @param ThreadRepository $threads
	 * @param UserRepository   $users
	 */
	public function __construct(PostRepository $posts, ReportRepository $reports, RoleRepository $roles, ThreadRepository $threads,UserRepository $users) {
		$this->reports = $reports;
		$this->roles = $roles;
		$this->users = $users;
		$this->threads = $threads;
		$this->posts = $posts;
	}

	/**
	 * @get("staff")
	 * @middleware("auth.staff")
	 *
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$this->nav('Staff Panel');
		$this->title('Staff Panel');
		return $this->view('staff.index');
	}

	/**
	 * @get("staff/moderation")
	 * @middleware("auth.moderation")
	 *
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
	 * @get("staff/moderation/report/{id}")
	 * @middleware("auth.moderation")
	 *
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
	 * @get("staff/moderation/thread/{id}-{name}/status={status}")
	 * @middleware("auth.moderation")
	 *
	 * @param $id
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
	 * @get("staff/moderation/thread/{id}-{name}/title")
	 * @middleware("auth.moderation")
	 *
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
	 * @post("staff/moderation/thread/{id}-{name}/title")
	 * @middleware("auth.moderation")
	 *
	 * @param StaffModerationThreadTitleForm $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postModerationThreadTitle(StaffModerationThreadTitleForm $form) {
		$thread = $this->threads->getById($form->id);
		if(!$thread)
			\App::abort(404);
		$thread->title = $form->title;
		$thread->save();
		return \redirect()->to('/forums/thread/' . \String::slugEncode($thread->id, $thread->title));
	}

	/**
	 * @get("staff/list")
	 *
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