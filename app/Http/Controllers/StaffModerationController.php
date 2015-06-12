<?php
namespace App\Http\Controllers;

use App\RuneTime\Forum\Threads\ThreadRepository;

/**
 * Class StaffModerationController
 */
class StaffModerationController extends Controller
{
    /**
     * @var ThreadRepository
     */
    private $threads;

    /**
     * @param ThreadRepository $threads
     */
    public function __construct(ThreadRepository $threads)
    {
        $this->threads = $threads;
    }

    /**
     * @param $id
     * @param $status
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function getThreadStatusSwitch($id, $status)
    {
        $thread = $this->threads->getById($id);
        if (empty($thread)) {
            return \redirect()->to('/');
        }

        $thread->status = $status;
        $thread->save();

        $subforum = $thread->subforum;

        return \redirect()->to($subforum->toSlug());
    }
}
