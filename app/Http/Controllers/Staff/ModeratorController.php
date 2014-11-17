<?php
namespace App\Http\Controllers;
use App\Http\Requests\Staff\ModerationThreadTitleRequest;
use App\RuneTime\Checkup\CheckupRepository;
use App\RuneTime\Forum\Reports\Report;
use App\RuneTime\Forum\Reports\ReportRepository;
use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Forum\Threads\ThreadRepository;
use App\RuneTime\Radio\HistoryRepository;
use App\RuneTime\Radio\MessageRepository;
use App\RuneTime\Radio\SessionRepository;
use App\RuneTime\Radio\TimetableRepository;
use App\Runis\Accounts\RoleRepository;
use App\Runis\Accounts\UserRepository;
class StaffModeratorController extends BaseController {
	/**
	 * @var PostRepository
	 */
	private $posts;
	/**
	 * @var ReportRepository
	 */
	private $reports;
	/**
	 * @var ThreadRepository
	 */
	private $threads;
	/**
	 * @var UserRepository
	 */
	private $users;

	/**
	 * @param PostRepository   $posts
	 * @param ReportRepository $reports
	 * @param ThreadRepository $threads
	 * @param UserRepository   $users
	 */
	public function __construct(PostRepository $posts, ReportRepository $reports, ThreadRepository $threads, UserRepository $users) {
		$this->posts = $posts;
		$this->reports = $reports;
		$this->threads = $threads;
		$this->users = $users;
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
		$this->bc(['staff' => 'Staff']);
		$this->nav('navbar.staff.staff');
		$this->title('Moderation Panel');
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
		$posts = $report->posts;
		$thread = $this->threads->getById($report->post->thread[0]->id);
		$status = $report->getStatus();
		$this->bc(['staff' => 'Staff']);
		$this->nav('navbar.staff.staff');
		$this->title('Viewing Report #' . $report->id);
		return $this->view('staff.moderation.report.view', compact('report', 'author', 'posts', 'thread', 'status'));
	}

	public function getModerationReportStatusSwitch($id) {
		$report = $this->reports->getById($id);
		if(!$report)
			\App::abort(404);
		$report->status_id = $report->status == Report::STATUS_OPEN ? Report::STATUS_CLOSED : Report::STATUS_OPEN;
		$report->save();
		return \redirect()->to('/staff/moderation');
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
		$this->bc(['staff' => 'Staff']);
		$this->nav('navbar.staff.staff');
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
}