<?php
namespace App\Http\Controllers;

use App\Http\Requests\Statuses\StatusCreateRequest;
use App\Http\Requests\Statuses\StatusReplyRequest;
use App\RuneTime\Forum\Threads\Post;
use App\RuneTime\Forum\Threads\Vote;
use App\RuneTime\Notifications\Notification;
use App\RuneTime\Statuses\Status;
use App\RuneTime\Statuses\StatusRepository;

/**
 * Class StatusController
 */
class StatusController extends Controller
{
    /**
     * @var StatusRepository
     */
    private $statuses;

    /**
     * @param StatusRepository $statuses
     */
    public function __construct(StatusRepository $statuses)
    {
        $this->statuses = $statuses;
    }
    /**
     * @return \Illuminate\View\View
     */
    public function getIndex()
    {
        if (\Auth::check() && \Auth::user()->isCommunity()) {
            $statusList = $this->statuses->getLatest(10, '<=', 1);
        } else {
            $statusList = $this->statuses->getLatest(10, '=', Status::STATUS_PUBLISHED);
        }

        $this->bc(['forums' => trans('forums.title')]);
        $this->nav('navbar.forums');
        $this->title('forums.statuses.title');

        return $this->view('forums.statuses.index', compact('statusList'));
    }

    /**
     * @param $id
     *
     * @return \Illuminate\View\View
     */
    public function getView($id)
    {
        $status = $this->statuses->getById($id);
        if (empty($status)) {
            return \Error::abort(404);
        }

        if (!$status->canView()) {
            return \Error::abort(403);
        }

        $this->bc(['forums' => trans('forums.title'), 'forums/statuses' => trans('forums.statuses.title')]);
        $this->nav('navbar.forums');
        $this->title('forums.statuses.view.title', ['author' => $status->author->display_name]);

        return $this->view('forums.statuses.view', compact('status'));
    }

    /**
     * @param $id
     * @param $newStatus
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function getStatusSwitch($id, $newStatus)
    {
        $status = $this->statuses->getById($id);
        if (empty($status)) {
            return \Error::abort(404);
        }

        $status->status = $newStatus;
        $status->save();

        return redirect()->to($status->toSlug());
    }

    /**
     * @param                    $id
     * @param StatusReplyRequest $form
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function postReply($id, StatusReplyRequest $form)
    {
        $status = $this->statuses->getById($id);
        if (empty($status)) {
            return \Error::abort(404);
        }

        $contentsParsed = with(new \Parsedown)->text($form->contents);
        $post = with(new Post)->saveNew(\Auth::user()->id, 1, Post::STATUS_VISIBLE, \Request::getClientIp(), $form->contents, $contentsParsed);
        with(new Vote)->saveNew(\Auth::user()->id, $post->id, Vote::STATUS_UP);
        $status->addPost($post);

        // Notify author
        if ($status->author->id !== \Auth::user()->id) {
            $contents = \Link::name(\Auth::user()->id) . " has replied to your status update <a href='" . $status->toSlug() . '#post' . $post->id . "'>" . $status->title . '</a>.';
            with(new Notification)->saveNew($status->author->id, 'Statuses', $contents, Notification::STATUS_UNREAD);
        }

        return redirect()->to($status->toSlug() . '#post' . $post->id);
    }

    /**
     * @return \Illuminate\View\View
     */
    public function getCreate()
    {
        $this->bc(['forums' => trans('forums.title'), 'forums/statuses' => trans('forums.statuses.title')]);
        $this->nav('navbar.forums');
        $this->title('forums.statuses.create.title');

        return $this->view('forums.statuses.create');
    }

    /**
     * @param StatusCreateRequest $form
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function postCreate(StatusCreateRequest $form)
    {
        $contentsParsed = with(new \Parsedown)->text($form->contents);
        $status = with(new Status)->saveNew(\Auth::user()->id, 0, Status::STATUS_PUBLISHED);
        $post = with(new Post)->saveNew(\Auth::user()->id, 1, Post::STATUS_VISIBLE, \Request::getClientIp(), $form->contents, $contentsParsed);
        with(new Vote)->saveNew(\Auth::user()->id, $post->id, Vote::STATUS_UP);
        $status->addPost($post);

        return redirect()->to('/forums/statuses/' . \String::slugEncode($status->id, 'by', \Auth::user()->display_name));
    }
}
