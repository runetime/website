<?php
namespace App\Http\Controllers;
use App\Http\Requests\ForumPostEditForm;
use App\Http\Requests\ForumPostReportForm;
use App\Http\Requests\Forums\PostEditRequest;
use App\Http\Requests\Forums\PostReportRequest;
use App\Http\Requests\Forums\PostVoteRequest;
use App\Http\Requests\Forums\ReplyRequest;
use App\Http\Requests\Forums\ThreadCreateForm;
use App\Http\Requests\Forums\ThreadCreateRequest;
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
/**
 * Class ForumController
 * @package App\Http\Controllers
 */
class ForumController extends BaseController {
	private $posts;
	private $subforums;
	private $statuses;
	private $tags;
	private $threads;
	private $users;
	/**
	 * @var VoteRepository
	 */
	private $votes;

	/**
	 * @param PostRepository     $posts
	 * @param SubforumRepository $subforums
	 * @param StatusRepository   $statuses
	 * @param TagRepository      $tags
	 * @param ThreadRepository   $threads
	 * @param VoteRepository     $votes
	 * @param UserRepository     $users
	 */
	public function __construct(PostRepository $posts, SubforumRepository $subforums, StatusRepository $statuses, TagRepository $tags, ThreadRepository $threads, VoteRepository $votes, UserRepository $users) {
		$this->posts = $posts;
		$this->subforums = $subforums;
		$this->statuses = $statuses;
		$this->tags = $tags;
		$this->threads = $threads;
		$this->users = $users;
		$this->votes = $votes;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$subforums = $this->subforums->getAll();
		$subforumList = [];
		foreach($subforums as $subforum) {
			if(!isset($subforumList[$subforum->parent]))
				$subforumList[$subforum->parent] = [];
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
		$this->title(trans('forums.name'));
		return $this->view('forums.index', compact('subforumList', 'recentThreads', 'recentPosts', 'forumInfo', 'activity'));
	}

	/**
	 * @param     $id
	 * @param int $page
	 *
	 * @return \Illuminate\View\View
	 */
	public function getSubforum($id, $page = 1) {
		$subforum = $this->subforums->getById($id);
		if(\Auth::check())
			\Cache::forever('user' . \Auth::user()->id . '.subforum#' . $id . '.read', time() + 1);
		$subforums = $this->subforums->getByParent($id);
		$threads = $this->threads->getBySubforum($subforum->id, $page, 'last_post', false);
		$hasMod = false;
		if(\Auth::check())
			$hasMod = \Auth::user()->isCommunity();
		// Threads
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
		$bc['forums'] = 'Forums';
		$this->bc(array_reverse($bc));
		$this->nav('navbar.forums');
		$this->title($subforum->name);
		return $this->view('forums.subforum.view', compact('subforum', 'subforums', 'threads', 'threadsPinned'));
	}

	/**
	 * @param     $id
	 * @param     $name
	 * @param int $page
	 *
	 * @return \Illuminate\View\View
	 */
	public function getThread($id, $name, $page = 1) {
		$thread = $this->threads->getById($id);
		if(!$thread)
			\App::abort(404);
		if(\Auth::check())
			\Cache::forever('user' . \Auth::user()->id . '.thread#' . $id . '.read', time() + 1);
		$thread->incrementViews();
		$subforum = $thread->subforum;
		$posts = $thread->posts();
		if(!\Auth::check() || !\Auth::user()->isCommunity())
			$posts = $posts->where('status', '=', Post::STATUS_VISIBLE);
		$posts = $posts->skip(($page - 1) * Thread::POSTS_PER_PAGE)->take(Thread::POSTS_PER_PAGE)->get();
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
		$bc['forums/'] = 'Forums';
		$this->bc(array_reverse($bc));
		$this->nav('navbar.forums');
		$this->title($thread->title);
		return $this->view('forums.thread.view', compact('thread', 'posts', 'page', 'pages'));
	}

	public function getThreadLastPost($id) {
		$thread = $this->threads->getByid($id);
		if(!$thread)
			return \App::abort(404);
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
		if(!$subforum)
			\App::abort(404);
		if($subforum->posts_enabled == false)
			return \redirect()->to('/forums');
		$bc = [];
		$bc['forums'] = 'Forums';
		if($subforum->parent != -1) {
			$parent = $this->subforums->getById($subforum->parent);
			$bc['forums/' . \String::slugEncode($parent->id, $parent->name)] = $parent->name;
		}
		$bc['forums/' . \String::slugEncode($subforum->id, $subforum->name)] = $subforum->name;
		$this->bc($bc);
		$this->nav('navbar.forums');
		$this->title('Creating a New Thread');
		return $this->view('forums.thread.create', compact('subforum'));
	}

	/**
	 * @param ThreadCreateRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postThreadCreate(ThreadCreateRequest $form) {
		$subforum = $this->subforums->getById($form->subforum);
		if(empty($subforum))
			\App::abort(404);
		$poll = -1;
		$thread = with(new Thread)->saveNew(\Auth::user()->id, $subforum->id, $form->title, 0, 1, 0, $poll, Thread::STATUS_VISIBLE);
		$post = with(new Post)->createNew(\Auth::user()->id, 0, Post::STATUS_VISIBLE, \String::encodeIP(), $form->contents, with(new \Parsedown)->text($form->contents));
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
	public function postReply($id, ReplyRequest $form) {
		$thread = $this->threads->getById($id);
		if(empty($thread))
			\App::abort(404);
		$parsedContents = with(new \Parsedown)->text($form->contents);
		$post = with(new Post)->createNew(\Auth::user()->id, 0, Post::STATUS_VISIBLE, \String::encodeIP(), $form->contents, $parsedContents);
		$thread->addPost($post);
		$thread->updateLastPost($post);
		$thread->incrementPosts();
		$this->subforums->updateLastPost($post->id, $thread->subforum->id);
		$this->subforums->incrementPosts($thread->subforum->id);
		\Auth::user()->incrementPostActive();

		// Notify author
		$notification = new Notification;
		$contents = \Link::name(\Auth::user()->id) . " has replied to your thread <a href='" . $thread->toSlug() . "'>" . $thread->title . "</a>.";
		$notification->saveNew($thread->author->id, 'Threads', $contents, Notification::STATUS_UNREAD);
		return $this->getThreadLastPost($thread->id);
	}

	/**
	 * @param $name
	 *
	 * @return \Illuminate\View\View
	 */
	public function getTagSearch($name) {
		$tag = $this->tags->getByName($name);
		if(empty($tag))
			\App::abort(404);
		$news = $tag->news;
		$threads = $tag->threads;
		$this->bc(['forums/' => 'Forums']);
		$this->nav('navbar.forums');
		$this->title('Tag: ' . $tag->name);
		return $this->view('forums.tags.view', compact('tag', 'news', 'threads'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getPostReport($id) {
		$post = $this->posts->getById($id);
		if(empty($post))
			\App::abort(404);
		$thread = $this->threads->getById($post->thread[0]->id);
		$this->nav('navbar.forums');
		$this->title('Reporting a Post');
		return $this->view('forums.post.report', compact('post', 'thread'));
	}

	/**
	 * @param                 $id
	 * @param PostVoteRequest $form
	 *
	 * @return string
	 */
	public function postPostVote($id, PostVoteRequest $form) {
		$post = $this->posts->getById($id);
		if(!$post)
			\App::abort(404);
		if(!$post->thread)
			\App::abort(404);
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
		header('Content-Type: application/json');
		return json_encode($response);
	}

	/**
	 * @param PostReportRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postPostReport(PostReportRequest $form) {
		$contentsParsed = with(new \Parsedown)->text($form->contents);
		$report = with(new Report)->saveNew(\Auth::user()->id, $form->id, Report::TYPE_POST, Report::STATUS_OPEN);
		$post = with(new Post)->saveNew(\Auth::user()->id, 0, 0, Post::STATUS_VISIBLE, \Request::getClientIp(), $form->contents, $contentsParsed);
		$report->addPost($post);
		return \redirect()->to('/forums');
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getPostEdit($id) {
		$post = $this->posts->getById($id);
		if(!$post)
			\App::abort(404);
		$thread = $this->threads->getById($post->thread[0]->id);
		$this->nav('navbar.forums');
		$this->title('Editing Post in ' . $thread->title);
		return $this->view('forums.post.edit', compact('post', 'thread'));
	}

	/**
	 * @param                 $id
	 * @param PostEditRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postPostEdit($id, PostEditRequest $form) {
		$post = $this->posts->getById($id);
		if(empty($post))
			\App::abort(404);
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
		if(!$post)
			\App::abort(404);
		$thread = $this->threads->getById($post->thread[0]->id);
		$post->status = Post::STATUS_INVISIBLE;
		$post->save();
		return \redirect()->to($thread->toSlug());
	}
}