<?php
namespace App\Http\Controllers;
use App\Http\Requests\ForumThreadCreateForm;
use App\RuneTime\Forum\Subforums\Subforum;
use App\RuneTime\Forum\Subforums\SubforumRepository;
use App\RuneTime\Forum\Threads\Post;
use App\RuneTime\Forum\Threads\PostRepository;
use App\RuneTime\Forum\Threads\Thread;
use App\RuneTime\Forum\Threads\ThreadRepository;
use App\Utilities\ZurbPresenter;
use Illuminate\Pagination\Paginator;
class ForumController extends BaseController {
	private $subforums;
	public function __construct(SubforumRepository $subforums, ThreadRepository $threads){
		$this->subforums = $subforums;
		$this->threads = $threads;
	}
	public function getIndex() {
		$subforums = $this->subforums->getAll();
		$subforumList = [];
		foreach($subforums as $subforum) $subforumList[$subforum->parent][] = $subforum;
		$this->nav('Forums');
		$this->title('Forums');
		return $this->view('forum.index', compact('subforumList'));
	}
	public function getSubforum($id, $name, $page=1) {
		$subforum = $this->subforums->getById($id);
		$threads = $this->threads->getBySubforum($subforum->id, Subforum::THREADS_PER_PAGE);
		if($page == "»")
			$page=ceil($this->threads->getCountInSubforum($subforum->id) / Subforum::THREADS_PER_PAGE);
		if($page == "«")
			$page = 1;
		if($page == 0)
			$page = 1;
		$paginator=new ZurbPresenter($this->subforums->paginate(Subforum::THREADS_PER_PAGE));
		$paginator->setCurrentPage($page);
		$paginator->url('forums/' . \String::slugEncode($subforum->id, $subforum->name));

		$bc = ['forums' => 'Forums'];
		if($subforum->parent != -1) {
			$parent = $this->subforums->getById($subforum->parent);
			$bc['forums/' . \String::slugEncode($parent->id, $parent->name)] = $parent->name;
		}
		$this->bc($bc);
		$this->nav('Forums');
		$this->title($subforum->name);
		return $this->view('forum.subforum.view', compact('subforum', 'threads', 'paginator'));
	}
	public function getThread($id, $name, $page=1) {
		
	}
	public function getThreadCreate($id, $name) {
		$subforum = $this->subforums->getById($id);
		if(!$subforum)
			// Error
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
		return $this->view('forum.thread.create',compact('subforum'));
	}
	public function postThreadCreate(ForumThreadCreateForm $form) {
		if(!$this->subforums->getById($form->subforum))
			// Error
		$post = new Post;
		$post->author_id = \Auth::user()->id;
		$post->ups = 0;
		$post->downs = 0;
		$post->status = Post::STATUS_VISIBLE;
		$post->ip = \String::encodeIP();
		$post->save();
		$thread=new Thread;
		$thread->author_id = \Auth::user()->id;
		$thread->title = $form->title;
		$thread->op = $post->id;
		$thread->views = 1;
		$thread->posts = 1;
		$thread->last_post = $post->id;
		$thread->poll = -1;
		$thread->status = Thread::STATUS_VISIBLE;
		$thread->tags = json_encode(explode(",",str_replace(", ",",",$form->tags)));
		$thread->subforum = $post->subforum;
		$thread->save();
		$thread->addPost($post->id);
	}
	public function getSettingsIndex() {
		return $this->getIndex();
	}
}