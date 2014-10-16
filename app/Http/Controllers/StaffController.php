<?php
namespace App\Http\Controllers;
use App\RuneTime\Forum\Reports\Report;
use App\RuneTime\Forum\Reports\ReportRepository;
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
	 * @param ReportRepository $reports
	 * @param RoleRepository   $roles
	 * @param UserRepository   $users
	 */
	public function __construct(ReportRepository $reports, RoleRepository $roles, ThreadRepository $threads,UserRepository $users) {
		$this->reports = $reports;
		$this->roles = $roles;
		$this->users = $users;
		$this->threads = $threads;
	}

	/**
	 * @get("staff")
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
	 * @return \Illuminate\View\View
	 */
	public function getModerationIndex() {
		$reports = $this->reports->getByStatus(Report::STATUS_OPEN);
		$reportList = [];
		foreach($reports as $report) {
			$report->reportee = $this->users->getById($report->author_id);
			$report->thread = $this->threads->getById($report->thread_id);
			array_push($reportList, $report);
		}
		$this->nav('Staff');
		$this->title('Moderation Centre');
		return $this->view('staff.moderation.index', compact('reportList'));
	}

	/**
	 * @get("staff/list")
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