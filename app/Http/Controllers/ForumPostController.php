<?php
namespace App\Http\Controllers;

use App\Http\Requests\Forums\PostEditRequest;
use App\Http\Requests\Forums\PostReportRequest;
use App\Http\Requests\Forums\PostVoteRequest;
use App\Http\Requests\Forums\ReplyRequest;
use App\RuneTime\Forum\Polls\AnswerRepository;
use App\RuneTime\Forum\Polls\QuestionRepository;
use App\RuneTime\Forum\Reports\Report;
use App\RuneTime\Forum\Subforums\SubforumRepository;
use App\RuneTime\Forum\Tags\TagRepository;
use App\RuneTime\Forum\Threads\Post;
use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Forum\Threads\ThreadRepository;
use App\RuneTime\Forum\Threads\Vote;
use App\RuneTime\Forum\Threads\VoteRepository;
use App\RuneTime\Notifications\Notification;
use App\RuneTime\Statuses\StatusRepository;
use App\RuneTime\Accounts\UserRepository;

class ForumPostController extends Controller
{
	/**
	 * @var AnswerRepository
	 */
	private $answers;
	/**
	 * @var \App\RuneTime\Forum\Polls\VoteRepository
	 */
	private $pollVotes;
	/**
	 * @var PostRepository
	 */
	private $posts;
	/**
	 * @var QuestionRepository
	 */
	private $questions;
	/**
	 * @var StatusRepository
	 */
	private $statuses;
	/**
	 * @var SubforumRepository
	 */
	private $subforums;
	/**
	 * @var TagRepository
	 */
	private $tags;
	/**
	 * @var ThreadRepository
	 */
	private $threads;
	/**
	 * @var UserRepository
	 */
	private $users;
	/**
	 * @var VoteRepository
	 */
	private $votes;

	/**
	 * @param AnswerRepository                         $answers
	 * @param \App\RuneTime\Forum\Polls\VoteRepository $pollVotes
	 * @param PostRepository                           $posts
	 * @param QuestionRepository                       $questions
	 * @param StatusRepository                         $statuses
	 * @param SubforumRepository                       $subforums
	 * @param TagRepository                            $tags
	 * @param ThreadRepository                         $threads
	 * @param UserRepository                           $users
	 * @param VoteRepository                           $votes
	 */
	public function __construct(
		AnswerRepository $answers,
		\App\RuneTime\Forum\Polls\VoteRepository $pollVotes,
		PostRepository $posts,
		QuestionRepository $questions,
		StatusRepository $statuses,
		SubforumRepository $subforums,
		TagRepository $tags,
		ThreadRepository $threads,
		UserRepository $users,
		VoteRepository $votes
	) {
		$this->answers = $answers;
		$this->pollVotes = $pollVotes;
		$this->posts = $posts;
		$this->questions = $questions;
		$this->statuses = $statuses;
		$this->subforums = $subforums;
		$this->tags = $tags;
		$this->threads = $threads;
		$this->users = $users;
		$this->votes = $votes;
	}

	/**
	 * @param $id
	 *
	 * @return mixed
	 */
	public function getDelete($id) {
		$post = $this->posts->getById($id);
		if(empty($post)) {
			return \Error::abort(404);
		}

		$thread = $this->threads->getById($post->thread[0]->id);
		$post->status = Post::STATUS_INVISIBLE;
		$post->save();

		return \redirect()->to($thread->toSlug());
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getEdit($id)
	{
		$post = $this->posts->getById($id);
		if(empty($post)) {
			return \Error::abort(404);
		}

		$thread = $this->threads->getById($post->thread[0]->id);

		$this->nav('navbar.forums');
		$this->title('forums.post.edit.title', ['thread' => $thread->title]);
		return $this->view('forums.post.edit', compact('post', 'thread'));
	}

	/**
	 * @param                 $id
	 * @param PostEditRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postEdit($id, PostEditRequest $form)
	{
		$post = $this->posts->getById($id);
		if(empty($post)) {
			return \Error::abort(404);
		}

		$thread = $this->threads->getById($post->thread[0]->id);
		$post->contents = $form->contents;
		$post->contents_parsed = with(new \Parsedown)->text($form->contents);
		$post->save();

		return \App::make('App\Http\Controllers\ForumThreadController')->getLastPost($thread->id);
	}

	/**
	 * @param              $id
	 * @param ReplyRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postReply($id, ReplyRequest $form)
	{
		$thread = $this->threads->getById($id);
		if(empty($thread)) {
			return \Error::abort(404);
		}

		$parsedContents = with(new \Parsedown)->text($form->contents);
		$post = with(new Post)->saveNew(\Auth::user()->id, 0, Post::STATUS_VISIBLE, \String::encodeIP(), $form->contents, $parsedContents);
		$post->author->incrementReputation();
		with(new Vote)->saveNew(\Auth::user()->id, $post->id, Vote::STATUS_UP);
		$thread->addPost($post);
		$thread->updateLastPost($post);
		$thread->incrementPosts();
		$this->subforums->updateLastPost($post->id, $thread->subforum->id);
		$this->subforums->incrementPosts($thread->subforum->id);
		\Auth::user()->incrementPostActive();

		// Notify author
		if($thread->author->id !== \Auth::user()->id) {
			$notification = new Notification;
			$name = \Link::name(\Auth::user()->id);
			$threadInfo = "<a href='" . $thread->toSlug() . "'>" . $thread->title . "</a>";
			$contents = trans('notifications.thread.reply', ['name' => $name, 'thread' => $threadInfo]);
			$notification->saveNew($thread->author->id, 'Threads', $contents, Notification::STATUS_UNREAD);
		}

		return \App::make('App\Http\Controllers\ForumThreadController')->getLastPost($thread->id);
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getReport($id)
	{
		$post = $this->posts->getById($id);
		if(empty($post)) {
			return \Error::abort(404);
		}

		$thread = $this->threads->getById($post->thread[0]->id);

		$this->nav('navbar.forums');
		$this->title('forums.post.report.title', ['author' => $post->author->display_name, 'thread' => $thread->title]);
		return $this->view('forums.post.report', compact('post', 'thread'));
	}

	/**
	 * @param PostReportRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postReport(PostReportRequest $form)
	{
		$contentsParsed = with(new \Parsedown)->text($form->contents);
		$report = with(new Report)->saveNew(\Auth::user()->id, $form->id, Report::TYPE_POST, Report::STATUS_OPEN);
		$post = with(new Post)->saveNew(\Auth::user()->id, 0, Post::STATUS_VISIBLE, \Request::getClientIp(), $form->contents, $contentsParsed);
		$report->addPost($post);

		return \redirect()->to('/forums');
	}

	/**
	 * @param                 $id
	 * @param PostVoteRequest $form
	 *
	 * @return string
	 */
	public function postVote($id, PostVoteRequest $form)
	{
		$post = $this->posts->getById($id);
		if(empty($post)) {
			return \Error::abort(404);
		}

		if(empty($post->thread)) {
			return \Error::abort(404);
		}

		$vote = $this->votes->getByPost($id);
		$newStatus = $form->vote == "up" ? Vote::STATUS_UP : Vote::STATUS_DOWN;
		$rep = $newStatus == Vote::STATUS_UP ? 1 : -1;
		if(!empty($vote)) {
			if($newStatus == Vote::STATUS_UP) {
				if($vote->status == Vote::STATUS_UP) {
					$rep = -1;
					$newStatus = Vote::STATUS_NEUTRAL;
				} else {
					$rep = 1;
					$newStatus = Vote::STATUS_UP;
				}
			} elseif($newStatus == Vote::STATUS_DOWN) {
				if($vote->status == Vote::STATUS_DOWN) {
					$rep = 1;
					$newStatus = Vote::STATUS_NEUTRAL;
				} else {
					$rep = -1;
					$newStatus = Vote::STATUS_DOWN;
				}
			}
		}

		$post->rep += $rep;
		$post->save();
		if(!empty($vote)) {
			$vote->status = $newStatus;
			$vote->save();
		} else {
			with(new Vote)->saveNew(\Auth::user()->id, $post->id, $newStatus);
		}

		// Poster's reputation
		$post->author->reputationChange($rep);
		$response = ['voted' => $newStatus];

		return json_encode($response);
	}
}