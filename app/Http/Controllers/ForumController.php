<?php
namespace App\Http\Controllers;
use App\Http\Requests\ForumPostEditForm;
use App\Http\Requests\ForumPostReportForm;
use App\Http\Requests\ForumThreadCreateForm;
use App\Http\Requests\ThreadReplyForm;
use App\RuneTime\Forum\Reports\Report;
use App\RuneTime\Forum\Subforums\Subforum;
use App\RuneTime\Forum\Subforums\SubforumRepository;
use App\RuneTime\Forum\Tags\Tag;
use App\RuneTime\Forum\Tags\TagRepository;
use App\RuneTime\Forum\Threads\Post;
use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Forum\Threads\Thread;
use App\RuneTime\Forum\Threads\ThreadRepository;
use App\RuneTime\Statuses\StatusRepository;
use App\Runis\Accounts\User;
use App\Runis\Accounts\UserRepository;
class ForumController extends BaseController {
	private $posts;
	private $subforums;
	private $statuses;
	private $tags;
	private $threads;
	private $users;

	/**
	 * @param PostRepository     $posts
	 * @param SubforumRepository $subforums
	 * @param StatusRepository   $statuses
	 * @param TagRepository      $tags
	 * @param ThreadRepository   $threads
	 * @param UserRepository     $users
	 */
	public function __construct(PostRepository $posts, SubforumRepository $subforums, StatusRepository $statuses, TagRepository $tags, ThreadRepository $threads, UserRepository $users) {
		$this->posts = $posts;
		$this->subforums = $subforums;
		$this->statuses = $statuses;
		$this->tags = $tags;
		$this->threads = $threads;
		$this->users = $users;
	}

	/**
	 * @Get("forums")
	 *
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$subforums = $this->subforums->getAll();
		$subforumList = [];
		foreach($subforums as $subforum) {
			if(!isset($subforumList[$subforum->parent]))
				$subforumList[$subforum->parent] = [];
			$subforum->last_post_info = $this->posts->getById($subforum->last_post);
			if(!empty($subforum->last_post_info))
				$subforum->last_thread_info = $this->threads->getById($subforum->last_post_info->thread_id);
			array_push($subforumList[$subforum->parent], $subforum);
		}
		$forumInfo = new \stdClass;
		$forumInfo->posts = $this->posts->getCount();
		$forumInfo->members = $this->users->getCount();
		$forumInfo->latest = $this->users->getLatest();
		$forumInfo->mostOnline = \Cache::get('info.most_online');
		$recentThreads = $this->threads->getX(5, 'desc');
		$this->nav('Forums');
		$this->title('Forums');
		return $this->view('forum.index', compact('subforumList', 'recentThreads', 'recentPosts', 'forumInfo'));
	}

	/**
	 * @Get("forums/{id}-{name}")
	 *
	 * @param     $id
	 * @param int $page
	 *
	 * @return \Illuminate\View\View
	 */
	public function getSubforum($id, $page = 1) {
		$subforum = $this->subforums->getById($id);
		if($page == "»")
			$page = ceil($this->threads->getCountInSubforum($subforum->id) / Subforum::THREADS_PER_PAGE);
		if($page == "«")
			$page = 1;
		if($page == 0)
			$page = 1;
		$subforums = $this->subforums->getByParent($id);
		$threads = $this->threads->getBySubforum($subforum->id, $page, 'last_post', false);
		// Subforums
		$subforumList = [];
		foreach($subforums as $subforumItem) {
			$subforumItem->last_post_info = $this->posts->getById($subforumItem->last_post);
			if(!empty($subforumItem->last_post_info))
				$subforumItem->last_thread_info = $this->threads->getById($subforumItem->last_post_info->thread_id);
			array_push($subforumList, $subforumItem);
		}
		$hasMod = false;
		if(\Auth::check())
			$hasMod = \Auth::user()->hasOneOfRoles(1, 10, 11);
		// Threads
		$threadsPinned = $this->threads->getBySubforum($subforum->id, $page, 'last_post', true);
		$threadListPrior = [];
		foreach($threadsPinned as $thread)
			array_push($threadListPrior, $thread);
		foreach($threads as $thread)
			array_push($threadListPrior, $thread);
		$threadList = [];
		foreach($threadListPrior as $thread) {
			$thread->last_post_info = $this->posts->getById($thread->last_post);
			if($hasMod) {
				$thread->modControls = new \stdClass;
				$thread->modControls->pin = $thread->getStatusPinSwitch();
				$thread->modControls->lock = $thread->getStatusLockSwitch();
				$thread->modControls->hidden = $thread->getStatusHiddenSwitch();
			}
			array_push($threadList, $thread);
		}
		// Breadcrumbs
		$bc = [];
		$parent = $this->subforums->getById($subforum->parent);
		while(true) {
			if(!empty($parent)) {
				$bc['forums/' . \String::slugEncode($parent->id, $parent->name)] = $parent->name;
				$parent = $this->subforums->getById($parent->parent);
			} else
				break;
		}
		$bc['forums'] = 'Forums';
		$bc = array_reverse($bc);
		$this->bc($bc);
		$this->nav('Forums');
		$this->title($subforum->name);
		return $this->view('forum.subforum.view', compact('subforum', 'subforumList', 'threadList'));
	}

	/**
	 * @get("forums/thread/{id}-{name}/page={page}")
	 * @get("forums/thread/{id}-{name}")
	 *
	 * @param     $id
	 * @param int $page
	 *
	 * @return \Illuminate\View\View
	 */
	public function getThread($id, $page = 1) {
		$thread = $this->threads->getById($id);
		if(!$thread)
			\App::abort(404);
		$thread->incrementViews();
		$subforum = $this->subforums->getbyId($thread->subforum_id);
		if(!\Auth::check() || (\Auth::check() && !\Auth::user()->hasOneOfRoles(1, 10, 11)))
			$posts = $thread->posts;
		else
			$posts = $thread->posts;
		// Posts
		$postList = [];
		foreach($posts as $post) {
			$post->author_info = $this->users->getById($post->author_id);
			array_push($postList, $post);
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
		$bc['forums/'] = 'Forums';
		$bc = array_reverse($bc);
		$this->bc($bc);
		$this->nav('Forums');
		$this->title($thread->title);
		return $this->view('forum.thread.view', compact('thread', 'postList'));
	}

	/**
	 * @get("forums/create/{id}-{name}")
	 * @middleware("auth.logged")
	 *
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getThreadCreate($id) {
		$subforum = $this->subforums->getById($id);
		if(!$subforum)
			\App::abort(404);
		$bc = [];
		$bc['forums'] = 'Forums';
		if($subforum->parent != -1) {
			$parent = $this->subforums->getById($subforum->parent);
			$bc['forums/' . \String::slugEncode($parent->id, $parent->name)] = $parent->name;
		}
		$bc['forums/' . \String::slugEncode($subforum->id, $subforum->name)] = $subforum->name;
		$this->bc($bc);
		$this->nav('Forums');
		$this->title('Creating a New Thread');
		return $this->view('forum.thread.create', compact('subforum'));
	}

	/**
	 * @middleware("auth.logged")
	 * @post("forums/create/{id}-{name}")
	 *
	 * @param ForumThreadCreateForm $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postThreadCreate(ForumThreadCreateForm $form) {
		$subforum = $this->subforums->getById($form->subforum);
		if(empty($subforum))
			return $this->view('errors.forum.subforum.missing');
		$tags = json_encode(explode(",", str_replace(", ", ",", $form->tags)));
		$poll = -1;
		$thread = new Thread;
		$thread = $thread->saveNew(\Auth::user()->id, $form->title, 0, 1, 0, $poll, Thread::STATUS_VISIBLE, $tags, $form->subforum);
		$post = new Post;
		$post = $post->saveNew(\Auth::user()->id, $thread->id, 0, 0, Post::STATUS_VISIBLE, \String::encodeIP(), $form->contents, $form->contents);
		$thread->last_post = $post->id;
		$thread->save();
		$post->thread()->associate($post);
		$post->save();
		// Tags
		foreach(explode(",", str_replace(", ", ",", $form->tags)) as $tagName) {
			$tag = $this->tags->getByName($tagName);
			if(empty($tag)) {
				$tag = new Tag;
				$tag = $tag->saveNew(\Auth::user()->id, $tagName);
			} else {
				$tag = $this->tags->getByName($tagName);
			}
			$this->tags->addTagThread($tag->id, $thread->id);
		}
		$this->subforums->updateLastPost($post->id, (int)$subforum->id);
		$this->subforums->incrementThreads($subforum->id);
		return \redirect()->action('ForumController@getThread', ['id' => $thread->id, 'name' => \String::slugEncode($thread->title)]);
	}

	/**
	 * @get("forum/thread/{id}-{name}/edit")
	 * @middleware("auth.logged")
	 *
	 * @param $id
	 */
	public function getThreadEdit($id) {
		$thread = $this->threads->getById($id);
		if(!$thread)
			\App::abort(404);
		if($thread->author_id != \Auth::user()->id)
			\App::abort(403);
	}

	/**
	 * @middleware("auth.logged")
	 * @post("forums/reply")
	 *
	 * @param ThreadReplyForm $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postReply(ThreadReplyForm $form) {
		$thread = Thread::find($form->input('id'));
		if(empty($thread))
			\App::abort(404);
		$post = new Post;
		$post->saveNew(\Auth::user()->id, 0, 0, Post::STATUS_VISIBLE, \String::encodeIP(), $form->contents, $form->contents);
		$thread->posts()->save($post);
		$thread->incrementPosts();
		$this->subforums->incrementPosts($thread->subforum);
		\Auth::user()->incrementPostActive();
		return \redirect()->to('/forums/thread/' . \String::slugEncode($thread->id, $thread->title));
	}

	/**
	 * @get("forums/tag/{name}")
	 *
	 * @param $name
	 *
	 * @return \Illuminate\View\View
	 */
	public function getTagSearch($name) {
		$tag = $this->tags->getByName($name);
		if(empty($tag))
			\App::abort(404);
		$threads = $tag->getThreads();
		$threadList = [];
		foreach($threads as $thread) {
			$thread = $this->threads->getById($thread->thread_id);
			$thread->last_post_info = $this->posts->getById($thread->last_post);
			array_push($threadList, $thread);
		}
		// Breadcrumbs
		$bc = ['forums/' => 'Forums'];
		$this->bc($bc);
		$this->nav('Forums');
		$this->title('Tag: ' . $tag->name);
		return $this->view('forum.tags.view', compact('tag', 'threadList'));
	}

	/**
	 * @get("forums/post/{id}/report")
	 * @middleware("auth.logged")
	 *
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getPostReport($id) {
		$post = $this->posts->getById($id);
		if(empty($post))
			\App::abort(404);
		$thread = $this->threads->getById($post->thread);
		$postee = $this->users->getById($post->author_id);
		$this->nav('Forums');
		$this->title('Reporting a Post');
		return $this->view('forum.post.report', compact('post', 'thread', 'postee'));
	}

	/**
	 * @middleware("auth.logged")
	 * @post("forums/post/{id}/report")
	 *
	 * @param ForumPostReportForm $form
	 *
	 * @return mixed
	 */
	public function postPostReport(ForumPostReportForm $form) {
		$contents = $form->contents;
		$contentsParsed = $contents;
		$report = new Report;
		$report->saveNew(\Auth::user()->id, $form->id, Report::TYPE_POST, Report::STATUS_OPEN, $contents, $contentsParsed);
		return \redirect()->to('/forums/');
	}

	/**
	 * @get("forums/post/{id}/edit")
	 * @middleware("auth.logged")
	 *
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getPostEdit($id) {
		$post = $this->posts->getById($id);
		if(!$post)
			\App::abort(404);
		$thread = $this->threads->getById($post->thread);
		$this->nav('Forums');
		$this->title('Editing Post in ' . $thread->title);
		return $this->view('forum.post.edit', compact('post', 'thread'));
	}

	/**
	 * @middleware("auth.logged")
	 * @post("forums/post/{id}/edit")
	 *
	 * @param ForumPostEditForm $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postPostEdit(ForumPostEditForm $form) {
		$post = $this->posts->getById($form->id);
		if(!$post)
			\App::abort(404);
		$thread = $this->threads->getById($post->thread);
		$post->contents = $form->contents;
		$post->contents_parsed = $form->contents;
		$post->save();
		return \redirect()->to('/forums/thread/' . \String::slugEncode($thread->id, $thread->title));
	}

	/**
	 * @get("forums/post/{id}/delete")
	 * @middleware("auth.moderation")
	 *
	 * @param $id
	 *
	 * @return mixed
	 */
	public function getPostDelete($id) {
		$post = $this->posts->getById($id);
		if(!$post)
			\App::abort(404);
		$thread = $this->threads->getById($post->thread);
		$post->status = Post::STATUS_INVISIBLE;
		$post->save();
		return \redirect()->to('/forums/thread/' . \String::slugEncode($thread->id, $thread->title));
	}
}