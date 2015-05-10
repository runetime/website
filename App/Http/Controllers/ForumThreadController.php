<?php
namespace App\Http\Controllers;

use App\Http\Requests\Forums\ThreadCreateRequest;
use App\RuneTime\Forum\Polls\Answer;
use App\RuneTime\Forum\Polls\AnswerRepository;
use App\RuneTime\Forum\Polls\Poll;
use App\RuneTime\Forum\Polls\Question;
use App\RuneTime\Forum\Polls\QuestionRepository;
use App\RuneTime\Forum\Subforums\SubforumRepository;
use App\RuneTime\Forum\Tags\Tag;
use App\RuneTime\Forum\Tags\TagRepository;
use App\RuneTime\Forum\Threads\Post;
use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Forum\Threads\Thread;
use App\RuneTime\Forum\Threads\ThreadRepository;
use App\RuneTime\Forum\Threads\Vote;
use App\RuneTime\Forum\Threads\VoteRepository;
use App\RuneTime\Statuses\StatusRepository;
use App\RuneTime\Accounts\UserRepository;

/**
 * Class ForumThreadController
 * @package App\Http\Controllers
 */
class ForumThreadController extends Controller
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
	 * @param     $id
	 * @param int $page
	 *
	 * @return \Illuminate\View\View
	 */
	public function getThread($id, $page = 1)
	{
		$thread = $this->threads->getById($id);
		if(empty($thread)) {
			return \Error::abort(404);
		}

		if(!$thread->canView()) {
			return \Error::abort(403);
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

		$poll = false;

		if(!empty($thread->poll)) {
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

					$voted = false;
					if(\Auth::check()) {
						$voted = $this->pollVotes->getByAllData(
							\Auth::user()->id,
							$answer->id,
							$question['id']);
					}

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
		}

		$this->bc(array_reverse($bc));
		$this->nav('navbar.forums');
		$this->title('forums.thread.view.title', ['name' => $thread->title]);
		return $this->view('forums.thread.view', compact('thread', 'poll', 'posts', 'page', 'pages'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getCreate($id) {
		$subforum = $this->subforums->getById($id);
		if(empty($subforum)) {
			return \Error::abort(404);
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
		$this->title('forums.thread.create.name', ['subforum' => $subforum->name]);
		return $this->view('forums.thread.create', compact('subforum'));
	}

	/**
	 * @param                     $id
	 * @param ThreadCreateRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postCreate($id, ThreadCreateRequest $form)
	{
		$subforum = $this->subforums->getById($id);
		if(empty($subforum)) {
			\Error::abort(404);
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
			if(empty($tag)) {
				$tag = with(new Tag)->saveNew(\Auth::user()->id, $tagName);
			}

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
	 * @param $id
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function getLastPost($id)
	{
		$thread = $this->threads->getByid($id);
		if(!$thread) {
			return \Error::abort(404);
		}

		$page = ceil($thread->posts_count / Thread::POSTS_PER_PAGE);
		$post = $thread->lastPost();
		return \redirect()->to($thread->toSlug() . '/page=' . $page . '/#post' . $post->id);
	}
}