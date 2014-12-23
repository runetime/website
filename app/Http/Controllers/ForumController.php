<?php
namespace App\Http\Controllers;

use App\Http\Requests\Forums\PollVoteRequest;
use App\Http\Requests\Forums\PostEditRequest;
use App\Http\Requests\Forums\PostReportRequest;
use App\Http\Requests\Forums\PostVoteRequest;
use App\Http\Requests\Forums\ReplyRequest;
use App\Http\Requests\Forums\ThreadCreateRequest;
use App\RuneTime\Forum\Polls\Answer;
use App\RuneTime\Forum\Polls\AnswerRepository;
use App\RuneTime\Forum\Polls\Poll;
use App\RuneTime\Forum\Polls\Question;
use App\RuneTime\Forum\Polls\QuestionRepository;
use App\RuneTime\Forum\Reports\Report;
use App\RuneTime\Forum\Subforums\SubforumRepository;
use App\RuneTime\Forum\Tags\Tag;
use App\RuneTime\Forum\Tags\TagRepository;
use App\RuneTime\Forum\Threads\Post;
use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Forum\Threads\Thread;
use App\RuneTime\Forum\Threads\ThreadRepository;
use App\RuneTime\Forum\Threads\Vote;
use App\RuneTime\Forum\Threads\VoteRepository;
use App\RuneTime\Notifications\Notification;
use App\RuneTime\Statuses\StatusRepository;
use App\Runis\Accounts\UserRepository;

class ForumController extends BaseController
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
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$subforums = $this->subforums->getAll();
		$subforumList = [];
		foreach($subforums as $subforum) {
			if(!isset($subforumList[$subforum->parent])) {
				$subforumList[$subforum->parent] = [];
			}

			array_push($subforumList[$subforum->parent], $subforum);
		}

		$forumInfo = new \stdClass;
		$forumInfo->posts = $this->posts->getCount();
		$forumInfo->members = $this->users->getCount();
		$forumInfo->latest = $this->users->getLatest();
		$forumInfo->mostOnline = \Cache::get('activity.most');
		$recentThreads = $this->threads->getX(5);
		$recentPosts = $this->posts->hasThread(5);
		$activity = \Cache::get('activity.users');

		$this->nav('navbar.forums');
		$this->title(trans('forums.title'));
		return $this->view('forums.index', compact('subforumList', 'recentThreads', 'recentPosts', 'forumInfo', 'activity'));
	}

	/**
	 * @param     $id
	 * @param int $page
	 *
	 * @return \Illuminate\View\View
	 */
	public function getSubforum($id, $page = 1)
	{
		$subforum = $this->subforums->getById($id);
		if(\Auth::check()) {
			\Cache::forever('user' . \Auth::user()->id . '.subforum#' . $id . '.read', time() + 1);
		}

		$subforums = $this->subforums->getByParent($id);
		$threads = $this->threads->getBySubforum($subforum->id, $page, 'last_post', false);
		$threadsPinned = $this->threads->getBySubforum($subforum->id, $page, 'last_post', true);
		// Breadcrumbs
		$bc = [];
		$parent = $this->subforums->getById($subforum->parent);
		while(true) {
			if(!empty($parent)) {
				$bc['forums/' . \String::slugEncode($parent->id, $parent->name)] = $parent->name;
				$parent = $this->subforums->getById($parent->parent);
			} else {
				break;
			}
		}

		$bc['forums'] = trans('forums.title');

		$this->bc(array_reverse($bc));
		$this->nav('navbar.forums');
		$this->title($subforum->name);
		return $this->view('forums.subforum.view', compact('subforum', 'subforums', 'threads', 'threadsPinned'));
	}

	/**
	 * @param     $id
	 * @param int $page
	 *
	 * @return \Illuminate\View\View
	 */
	public function getThread($id, $page = 1)
	{
		$thread = $this->threads->getById($id);
		if(!$thread) {
			\App::abort(404);
		}

		if(\Auth::check()) {
			\Cache::forever('user' . \Auth::user()->id . '.thread#' . $id . '.read', time() + 1);
		}

		$thread->incrementViews();
		$subforum = $thread->subforum;
		$posts = $thread->posts();
		if(!\Auth::check() || !\Auth::user()->isCommunity()) {
			$posts = $posts->where('status', '=', Post::STATUS_VISIBLE);
			$posts = $posts->skip(($page - 1) * Thread::POSTS_PER_PAGE)->take(Thread::POSTS_PER_PAGE)->get();
		} else {
			$posts = $posts->get();
		}


		// Breadcrumbs
		$bc = [];
		$subforumParent = $subforum;
		while(true) {
			if(!empty($subforumParent)) {
				$bc['forums/' . \String::slugEncode($subforumParent->id, $subforumParent->name)] = $subforumParent->name;
				$subforumParent = $this->subforums->getById($subforumParent->parent);
			} else {
				break;
			}
		}

		$pages = ceil($thread->posts_count / Thread::POSTS_PER_PAGE);
		$bc['forums'] = trans('navbar.forums');

		$poll = [
			'title'     => $thread->poll->title,
			'questions' => []
		];
		foreach($thread->poll->questions as $key => $pollQuestion) {
			$question = [
				'answers' => [],
				'id'      => $pollQuestion->id,
				'name'    => $pollQuestion->contents,
				'votes'   => $pollQuestion->votes
			];
			foreach($pollQuestion->answers as $answer) {
				$percentage = 0;
				if($question['votes'] > 0) {
					$percentage = round(($answer->votes / $question['votes']) * 100);
				}

				$voted = $this->pollVotes->getByAllData(
					\Auth::user()->id,
					$answer->id,
					$question['id']
					);

				array_push($question['answers'], [
					'contents'   => $answer->contents,
					'id'         => $answer->id,
					'json'       => json_encode([
						'answer'   => $answer->id,
						'question' => $question['id'],
					]),
					'percentage' => $percentage,
					'voted'      => !empty($voted),
					'votes'      => $answer->votes,
				]);
			}

			array_push($poll['questions'], $question);
		}

		$this->bc(array_reverse($bc));
		$this->nav('navbar.forums');
		$this->title(trans('forums.thread.view.title', ['name' => $thread->title]));
		return $this->view('forums.thread.view', compact('thread', 'poll', 'posts', 'page', 'pages'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function getThreadLastPost($id)
	{
		$thread = $this->threads->getByid($id);
		if(!$thread) {
			return \App::abort(404);
		}

		$page = ceil($thread->posts_count / Thread::POSTS_PER_PAGE);
		$post = $thread->lastPost();
		return \redirect()->to($thread->toSlug() . '/page=' . $page . '/#post' . $post->id);
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getThreadCreate($id) {
		$subforum = $this->subforums->getById($id);
		if(!$subforum) {
			\App::abort(404);
		}

		if($subforum->posts_enabled == false) {
			return \redirect()->to('/forums');
		}

		$bc = [];
		$bc['forums'] = trans('navbar.forums');
		if($subforum->parent != -1) {
			$parent = $this->subforums->getById($subforum->parent);
			$bc['forums/' . \String::slugEncode($parent->id, $parent->name)] = $parent->name;
		}

		$bc['forums/' . \String::slugEncode($subforum->id, $subforum->name)] = $subforum->name;

		$this->bc($bc);
		$this->nav('navbar.forums');
		$this->title(trans('forums.thread.create.name', ['subforum' => $subforum->name]));
		return $this->view('forums.thread.create', compact('subforum'));
	}

	/**
	 * @param                     $id
	 * @param ThreadCreateRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postThreadCreate($id, ThreadCreateRequest $form)
	{
		$subforum = $this->subforums->getById($id);
		if(empty($subforum)) {
			abort(404);
		}

		$poll = -1;
		if(strlen($form->poll_title) > 0) {
			foreach($form->questions as $key => $question) {
				if(!empty($question) && !empty($form->answers[$key][1])) {
					if($poll === -1) {
						$poll = with(new Poll)->saveNew(1, $form->poll_title);
					}

					$question = with(new Question)->saveNew($poll->id, $question, 0);
					foreach($form->answers[$key] as $answer) {
						if(strlen($answer) > 0) {
							with(new Answer)->saveNew($question->id, $answer, 0);
						}
					}
				}
			}
		}

		$thread = with(new Thread)->saveNew(\Auth::user()->id, $subforum->id, $form->title, 0, 1, 0, -1, Thread::STATUS_VISIBLE);
		$post = with(new Post)->saveNew(\Auth::user()->id, 1, Post::STATUS_VISIBLE, \String::encodeIP(), $form->contents, with(new \Parsedown)->text($form->contents));
		$post->author->incrementReputation();
		with(new Vote)->saveNew(\Auth::user()->id, $post->id, Vote::STATUS_UP);
		$thread->last_post = $post->id;
		$thread->save();
		$thread->addPost($post);
		// Tags
		foreach(explode(",", str_replace(", ", ",", $form->tags)) as $tagName) {
			$tag = $this->tags->getByName($tagName);
			if(empty($tag))
				$tag = with(new Tag)->saveNew(\Auth::user()->id, $tagName);
			$thread->addTag($tag);
		}

		if($poll !== -1) {
			$poll->thread_id = $thread->id;
			$poll->save();
			$thread->poll_id = $poll->id;
			$thread->save();
		}

		$this->subforums->incrementPosts($subforum->id);
		$this->subforums->updateLastPost($post->id, $subforum->id);
		$this->subforums->incrementThreads($subforum->id);
		return \redirect()->to($thread->toSlug());
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
			\App::abort(404);
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

		return $this->getThreadLastPost($thread->id);
	}

	/**
	 * @param $name
	 *
	 * @return \Illuminate\View\View
	 */
	public function getTagSearch($name)
	{
		$tag = $this->tags->getByName($name);
		$news = [];
		$threads = [];
		if(!empty($tag)) {
			$news = $tag->news;
			$threads = $tag->threads;
		}

		$this->bc(['forums' => trans('navbar.forums')]);
		$this->nav('navbar.forums');
		$this->title(trans('forums.tags.title', ['name' => $name]));
		return $this->view('forums.tags.view', compact('tag', 'news', 'threads', 'name'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getPostReport($id)
	{
		$post = $this->posts->getById($id);
		if(empty($post)) {
			\App::abort(404);
		}

		$thread = $this->threads->getById($post->thread[0]->id);

		$this->nav('navbar.forums');
		$this->title(trans('forums.post.report.title', ['author' => $post->author->display_name, 'thread' => $thread->title]));
		return $this->view('forums.post.report', compact('post', 'thread'));
	}

	/**
	 * @param PostReportRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postPostReport(PostReportRequest $form)
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
	public function postPostVote($id, PostVoteRequest $form)
	{
		$post = $this->posts->getById($id);
		if(!$post) {
			\App::abort(404);
		}

		if(!$post->thread) {
			\App::abort(404);
		}

		$vote = $this->votes->getByPost($id);
		$newStatus = $form->vote == "up" ? Vote::STATUS_UP : Vote::STATUS_DOWN;
		$rep = $newStatus == Vote::STATUS_UP ? 1 : -1;
		if($vote) {
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
		if($vote) {
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

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getPostEdit($id)
	{
		$post = $this->posts->getById($id);
		if(!$post) {
			\App::abort(404);
		}

		$thread = $this->threads->getById($post->thread[0]->id);

		$this->nav('navbar.forums');
		$this->title(trans('forums.post.edit.title', ['thread' => $thread->title]));
		return $this->view('forums.post.edit', compact('post', 'thread'));
	}

	/**
	 * @param                 $id
	 * @param PostEditRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postPostEdit($id, PostEditRequest $form)
	{
		$post = $this->posts->getById($id);
		if(empty($post)) {
			\App::abort(404);
		}

		$thread = $this->threads->getById($post->thread[0]->id);
		$post->contents = $form->contents;
		$post->contents_parsed = with(new \Parsedown)->text($form->contents);
		$post->save();

		return $this->getThreadLastPost($thread->id);
	}

	/**
	 * @param $id
	 *
	 * @return mixed
	 */
	public function getPostDelete($id) {
		$post = $this->posts->getById($id);
		if(!$post) {
			\App::abort(404);
		}

		$thread = $this->threads->getById($post->thread[0]->id);
		$post->status = Post::STATUS_INVISIBLE;
		$post->save();

		return \redirect()->to($thread->toSlug());
	}

	/**
	 * @param PollVoteRequest $form
	 *
	 * @return string
	 */
	public function postPollVote(PollVoteRequest $form)
	{
		$response = ['done' => false];
		$question = $this->questions->getById($form->question);
		$answer = $this->answers->getByid($form->answer);
		if(empty($question) || empty($answer)) {
			$response['error'] = -1;

			return json_encode($response);
		}

		$poll = $question->poll;
		$vote = $this->pollVotes->getByData(
			\Auth::user()->id,
			$question->id
		);
		if(!empty($vote)) {
			$voteAnswer = $vote->answer;
			$voteAnswer->decrement('votes');
			$voteAnswer->save();
			$question->decrement('votes');
			$question->save();
			$vote->delete();
		}

		$vote = with(new \App\RuneTime\Forum\Polls\Vote)->saveNew(
			$answer->id,
			\Auth::user()->id,
			$poll->id,
			$question->id
			);

		if(!empty($vote)) {
			$answer->increment('votes');
			$answer->save();
			$question->increment('votes');
			$answer->save();
			$response['done'] = true;
		}

		return json_encode($response);
	}
}