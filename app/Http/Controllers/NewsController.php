<?php
namespace App\Http\Controllers;
use App\Http\Requests\News\CreateNewsRequest;
use App\Http\Requests\News\ReplyRequest;
use App\RuneTime\Forum\Threads\Post;
use App\RuneTime\Forum\Tags\Tag;
use App\RuneTime\Forum\Tags\TagRepository;
use App\RuneTime\News\News;
use App\RuneTime\News\NewsRepository;
use Illuminate\Contracts\Auth\Guard;
class NewsController extends BaseController {
	protected $auth;
	protected $news;
	/**
	 * @var TagRepository
	 */
	private $tags;

	/**
	 * @param Guard          $auth
	 * @param NewsRepository $news
	 * @param TagRepository  $tags
	 */
	public function __construct(Guard $auth, NewsRepository $news, TagRepository $tags) {
		$this->auth = $auth;
		$this->news = $news;
		$this->tags = $tags;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		if(\Auth::check() && \Auth::user()->isLeader())
			$canAdd = true;
		$news = $this->news->getRecentNews(5);
		$this->nav('navbar.runetime.runetime');
		$this->title('News');
		return $this->view('news.index', compact('news', 'canAdd'));
	}

	/**
	 * @param $id
	 *
	 * @return \Illuminate\View\View
	 */
	public function getView($id) {
		$news = $this->news->getById($id);
		$tags = $news->tags;
		$posts = $news->posts();
		if(!\Auth::check() || !\Auth::user()->isCommunity())
			$posts = $posts->where('status', '=', Post::STATUS_VISIBLE);
		$posts = $posts->get();
		$this->bc(['news' => 'News']);
		$this->nav('navbar.runetime.runetime');
		$this->title($news->title);
		return $this->view('news.view', compact('news', 'posts', 'tags'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getCreate() {
		$this->bc(['news' => 'News']);
		$this->nav('navbar.runetime.runetime');
		$this->title('Create Newspiece');
		return $this->view('news.create');
	}

	/**
	 * @param CreateNewsRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postCreate(CreateNewsRequest $form) {
		$contentsParsed = with(new \Parsedown)->text($form->contents);
		$news = new News;
		$news = $news->saveNew(\Auth::user()->id, $form->name, $form->contents, $contentsParsed, 0, News::STATUS_PUBLISHED);
		if($form->hasFile('image') && $form->file('image')->isValid())
			$form->file('image')->move('./img/news/' . $news->id . '.png');

		// Tags
		foreach(explode(",", str_replace(", ", ",", $form->tags)) as $tagName) {
			$tag = $this->tags->getByName($tagName);
			if(empty($tag)) {
				$tag = new Tag;
				$tag = $tag->saveNew(\Auth::user()->id, $tagName);
			} else {
				$tag = $this->tags->getByName($tagName);
			}
			$news->addTag($tag);
		}
		return \redirect()->to('news/' . \String::slugEncode($news->id, $news->title));
	}

	/**
	 * @param                  $id
	 * @param NewsReplyRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postReply($id, ReplyRequest $form) {
		$news = $this->news->getById($id);
		if(empty($news))
			\App::abort(404);
		$parsedContents = with(new \Parsedown)->text($form->contents);
		$post = new Post;
		$post = $post->saveNew(\Auth::user()->id, 0, 0, Post::STATUS_VISIBLE, \String::encodeIP(), $form->contents, $parsedContents);
		$news->addPost($post);
		$news->incrementPosts();
		return \redirect()->to('/news/' . \String::slugEncode($news->id, $news->title) . '#comments');
	}
}