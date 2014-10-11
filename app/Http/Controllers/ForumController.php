<?php
namespace App\Http\Controllers;
use App\Http\Requests\ForumThreadCreateForm;
use App\Http\Requests\ThreadReplyForm;
use App\RuneTime\Forum\Subforums\Subforum;
use App\RuneTime\Forum\Subforums\SubforumRepository;
use App\RuneTime\Forum\Threads\Post;
use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Forum\Threads\Thread;
use App\RuneTime\Forum\Threads\ThreadRepository;
use App\RuneTime\Statuses\StatusRepository;
use App\Runis\Accounts\UserRepository;
use App\Utilities\ZurbPresenter;
use Illuminate\Pagination\Paginator;
class ForumController extends BaseController {
	private $posts;
	private $subforums;
	private $statuses;
	private $threads;
	private $users;
	public function __construct(PostRepository $posts, SubforumRepository $subforums, StatusRepository $statuses, ThreadRepository $threads, UserRepository $users){
		$this->posts = $posts;
		$this->subforums = $subforums;
		$this->statuses = $statuses;
		$this->threads = $threads;
		$this->users = $users;
	}
	public function getIndex() {
		$subforums = $this->subforums->getAll();
		$subforumList = [];
		foreach($subforums as $subforum) {
			if(!isset($subforumList[$subforum->parent])) $subforumList[$subforum->parent] = [];
			$subforum->last_post_info = $this->posts->getById($subforum->last_post);
			if(!empty($subforum->last_post_info)) $subforum->last_thread_info = $this->threads->getById($subforum->last_post_info->thread);
			array_push($subforumList[$subforum->parent], $subforum);
		}
		$recentThreads = $this->threads->getX(5, 'desc');
		$this->nav('Forums');
		$this->title('Forums');
		return $this->view('forum.index', compact('subforumList', 'recentThreads'));
	}
	public function getSubforum($id, $name, $page=1) {
		$subforum = $this->subforums->getById($id);
		$subforums = $this->subforums->getByParent($id);
		$threads = $this->threads->getBySubforum($subforum->id, $page, 'last_post', 'desc');
		if($page == "»") $page=ceil($this->threads->getCountInSubforum($subforum->id) / Subforum::THREADS_PER_PAGE);
		if($page == "«") $page = 1;
		if($page == 0)   $page = 1;
		
		// Subforums
		$subforumList = [];
		foreach($subforums as $subforumItem) {
			$subforumItem->last_post_info = $this->posts->getById($subforumItem->last_post);
			if(!empty($subforumItem->last_post_info)) $subforumItem->last_thread_info = $this->threads->getById($subforumItem->last_post_info->thread);
			array_push($subforumList, $subforumItem);
		}

		// Threads
		$threadList = [];
		foreach($threads as $thread) {
			$thread->last_post_info = $this->posts->getById($thread->last_post);
			array_push($threadList, $thread);
		}
		// Pagination
		$paginator=new ZurbPresenter($this->subforums->paginate(Subforum::THREADS_PER_PAGE));
		$paginator->setCurrentPage($page);
		$paginator->url('forums/' . \String::slugEncode($subforum->id, $subforum->name));

		// Breadcrumbs
		$bc = [];
		$parent = $this->subforums->getById($subforum->parent);
		while(true){
			if(!empty($parent)){
				$bc['forums/' . \String::slugEncode($parent->id, $parent->name)] = $parent->name;
				$parent = $this->subforums->getById($parent->parent);
			}
			else
				break;
		}
		$bc['forums']='Forums';
		$bc = array_reverse($bc);
		$this->bc($bc);
		$this->nav('Forums');
		$this->title($subforum->name);
		return $this->view('forum.subforum.view', compact('subforum', 'subforumList', 'threads', 'paginator'));
	}
	public function getThread($id, $name='', $page=1) {
		$thread = $this->threads->getById($id);
		if(!$thread) return \App::abort(404);
		$thread->incrementViews();
		$subforum = $this->subforums->getbyId($thread->subforum);
		$posts = $this->posts->getX($thread->id);
		
		// Posts
		$postList = [];
		foreach($posts as $post){
			$post->author_info = $this->users->getById($post->author_id);
			array_push($postList, $post);
		}

		// Breadcrumbs
		$bc = [];
		$subforumParent = $subforum;
		while(true){
			if(!empty($subforumParent)){
				$bc['forums/' . \String::slugEncode($subforumParent->id, $subforumParent->name)] = $subforumParent->name;
				$subforumParent = $this->subforums->getById($subforumParent->parent);
			}
			else
				break;
		}
		$bc['forums/'] = 'Forums';
		$bc = array_reverse($bc);
		$this->bc($bc);
		$this->nav('Forums');
		$this->title($thread->title);
		return $this->view('forum.thread.view', compact('thread', 'postList'));
	}
	public function getThreadCreate($id, $name='') {
		$subforum = $this->subforums->getById($id);
		if(!$subforum) return \App::abort(404);
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
	public function postThreadCreate(ForumThreadCreateForm $form) {
		$subforum = $this->subforums->getById($form->subforum);
		if(!$subforum) return $this->view('errors.forum.subforum.missing');
		$tags = json_encode(explode(",",str_replace(", ",",",$form->tags)));
		$thread = new Thread;
		$thread = $thread->saveNew(\Auth::user()->id, $form->title, 1, 1, 0, -1, Thread::STATUS_VISIBLE, $tags, $form->subforum);
		
		$post = new Post;
		$post = $post->saveNew(\Auth::user()->id, 0, 0, Post::STATUS_VISIBLE, \String::encodeIP(), $thread->id, $form->contents, $form->contents);
		
		$thread->last_post = $post->id;
		$thread->save();
		$this->subforums->updateLastPost($post->id, (int)$subforum->id);
		$this->subforums->incrementThreads($subforum->id);
		return \redirect()->action('ForumController@getThread', ['id' => $thread->id, 'name' => \String::slugEncode($thread->title)]);
	}
	public function postReply(ThreadReplyForm $form) {
		$thread = $this->threads->getById($form->thread);
		if(empty($thread)) return \App::abort(404);
		$post = new Post;
		$post->saveNew(\Auth::user()->id, 0, 0, Post::STATUS_VISIBLE, \String::encodeIP(), $thread->id, $form->contents, $form->contents);
		
		$thread->incrementPosts();
		$this->subforums->incrementPosts($thread->subforum);
		\Auth::user()->incrementPostActive();
		return \redirect()->to('/forums/thread/' . \String::slugEncode($thread->id, $thread->title));
	}
	public function getProfileIndex($id, $name = '') {
		$profile = $this->users->getById($id);
		if(!$profile) return \App::abort(404);
		$profile->incrementProfileViews();
		$latestStatus = $this->statuses->getByAuthor($profile->id);
		$bc = ['forums/' => 'Forums'];
		$this->bc($bc);
		$this->nav('Forums');
		$this->title($profile->display_name);
		return $this->view('forum.profile.index', compact('profile'));
	}
	public function getProfileFeed() {
		
	}
	public function getProfileFriends() {
		
	}
	public function getSettingsIndex() {
		return $this->getIndex();
	}
}