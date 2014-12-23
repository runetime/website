<?php
namespace App\Http\Controllers;

use App\Http\Requests\Forums\PollVoteRequest;
use App\RuneTime\Forum\Polls\AnswerRepository;
use App\RuneTime\Forum\Polls\QuestionRepository;
use App\RuneTime\Forum\Subforums\SubforumRepository;
use App\RuneTime\Forum\Tags\TagRepository;
use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Forum\Threads\ThreadRepository;
use App\RuneTime\Forum\Threads\VoteRepository;
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