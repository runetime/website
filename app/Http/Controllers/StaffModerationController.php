<?php
namespace App\Http\Controllers;

use App\RuneTime\Forum\Threads\ThreadRepository;

class StaffModerationController extends BaseController
{
	/**
	 * @var ThreadRepository
	 */
	private $threads;

	/**
	 * @param ThreadRepository $threads
	 */
	public function __construct(ThreadRepository $threads) {
		$this->threads = $threads;
	}

	public function getThreadStatusSwitch($id, $status)
	{
		$thread = $this->threads->getById($id);
		if(!$thread) {
			return \redirect()->to('/');
		}

		$thread->status = $status;
		$thread->save();

		$subforum = $thread->subforum;

		return \redirect()->to($subforum->toSlug());
	}
}