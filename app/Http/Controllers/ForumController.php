<?php
namespace App\Http\Controllers;
use App\Http\Requests\ForumThreadCreateForm;
use App\Http\Requests\ThreadReplyForm;
use App\RuneTime\Forum\Subforums\Subforum;
use App\RuneTime\Forum\Subforums\SubforumRepository;
use App\RuneTime\Forum\Tags\Tag;
use App\RuneTime\Forum\Tags\TagRepository;
use App\RuneTime\Forum\Threads\Post;
use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Forum\Threads\Thread;
use App\RuneTime\Forum\Threads\ThreadRepository;
use App\RuneTime\Statuses\StatusRepository;
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
				$subforum->last_thread_info = $this->threads->getById($subforum->last_post_info->thread);
			array_push($subforumList[$subforum->parent], $subforum);
		}
		$recentThreads = $this->threads->getX(5, 'desc');
		$this->nav('Forums');
		$this->title('Forums');
		return $this->view('forum.index', compact('subforumList', 'recentThreads'));
	}

	/**
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
		$threads = $this->threads->getBySubforum($subforum->id, $page, 'last_post', 'desc');
		// Subforums
		$subforumList = [];
		foreach($subforums as $subforumItem) {
			$subforumItem->last_post_info = $this->posts->getById($subforumItem->last_post);
			if(!empty($subforumItem->last_post_info))
				$subforumItem->last_thread_info = $this->threads->getById($subforumItem->last_post_info->thread);
			array_push($subforumList, $subforumItem);
		}
		// Threads
		$threadList = [];
		foreach($threads as $thread) {
			$thread->last_post_info = $this->posts->getById($thread->last_post);
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
		return $this->view('forum.subforum.view', compact('subforum', 'subforumList', 'threads'));
	}

	/**
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
		$subforum = $this->subforums->getbyId($thread->subforum);
		$posts = $this->posts->getX($thread->id, Thread::POSTS_PER_PAGE, $page);
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
	 * @param ForumThreadCreateForm $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postThreadCreate(ForumThreadCreateForm $form) {
		$subforum = $this->subforums->getById($form->subforum);
		if(empty($subforum))
			return $this->view('errors.forum.subforum.missing');
		$tags = json_encode(explode(",", str_replace(", ", ",", $form->tags)));
		$thread = new Thread;
		$thread = $thread->saveNew(\Auth::user()->id, $form->title, 1, 1, 0, -1, Thread::STATUS_VISIBLE, $tags, $form->subforum);
		$post = new Post;
		$post = $post->saveNew(\Auth::user()->id, 0, 0, Post::STATUS_VISIBLE, \String::encodeIP(), $thread->id, $form->contents, $form->contents);
		$thread->last_post = $post->id;
		$thread->save();
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
	 * @param ThreadReplyForm $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postReply(ThreadReplyForm $form) {
		$thread = $this->threads->getById($form->thread);
		if(empty($thread))
			\App::abort(404);
		$post = new Post;
		$post->saveNew(\Auth::user()->id, 0, 0, Post::STATUS_VISIBLE, \String::encodeIP(), $thread->id, $form->contents, $form->contents);
		$thread->incrementPosts();
		$this->subforums->incrementPosts($thread->subforum);
		\Auth::user()->incrementPostActive();
		return \redirect()->to('/forums/thread/' . \String::slugEncode($thread->id, $thread->title));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getProfileIndex($id) {
		$profile = $this->users->getById($id);
		if(!$profile)
			\App::abort(404);
		$profile->incrementProfileViews();
		$latestStatus = $this->statuses->getByAuthor($profile->id);
		$bc = ['forums/' => 'Forums'];
		$this->bc($bc);
		$this->nav('Forums');
		$this->title($profile->display_name);
		return $this->view('forum.profile.index', compact('profile', 'latestStatus'));
	}

	public function getProfileFeed() {
	}

	public function getProfileFriends() {
	}

	public function getSettingsIndex() {
	}

	public function getSettingsInformation() {
	}

	public function getSettingsNotifications() {
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
}