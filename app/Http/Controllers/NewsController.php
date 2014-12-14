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
		$canAdd = false;
		if(\Auth::check() && \Auth::user()->isLeader())
			$canAdd = true;
		$news = $this->news->getRecentNews(5);
		$this->nav('navbar.runetime.runetime');
		$this->title(trans('news.title'));
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
		$this->bc(['news' => trans('news.title')]);
		$this->nav('navbar.runetime.runetime');
		$this->title(trans('news.view.title', ['name' => $news->title]));
		return $this->view('news.view', compact('news', 'posts', 'tags'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getCreate() {
		$this->bc(['news' => trans('news.title')]);
		$this->nav('navbar.runetime.runetime');
		$this->title(trans('news.create_newspiece'));
		return $this->view('news.create');
	}

	/**
	 * @param CreateNewsRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postCreate(CreateNewsRequest $form) {
		$contentsParsed = with(new \Parsedown)->text($form->contents);
		$news = with(new News)->saveNew(\Auth::user()->id, $form->name, $form->contents, $contentsParsed, 0, News::STATUS_PUBLISHED);
		if(\Request::hasFile('image')) {
			\Img::make($form->file('image'))->save();
			$thumbnail = \Img::make($form->file('image'));
			$h = $thumbnail->height();
			$w = $thumbnail->width();
			$scale = max($h, $w) / 200;
			$h /= $scale;
			$w /= $scale;
			$thumbnail->resize((int) $w, (int) $h);
			$thumbnail->save('./img/news/thumbnail/' . $news->id . '.png');
		}
		// Tags
		foreach(explode(",", str_replace(", ", ",", $form->tags)) as $tagName) {
			$tag = $this->tags->getByName($tagName);
			if(empty($tag))
				$tag = with(new Tag)->saveNew(\Auth::user()->id, $tagName);
			else
				$tag = $this->tags->getByName($tagName);
			$news->addTag($tag);
		}
		return \redirect()->to($news->toSlug());
	}

	/**
	 * @param              $id
	 * @param ReplyRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postReply($id, ReplyRequest $form) {
		$news = $this->news->getById($id);
		if(empty($news))
			\App::abort(404);
		$parsedContents = with(new \Parsedown)->text($form->contents);
		$post = with(new Post)->saveNew(\Auth::user()->id, 0, 0, Post::STATUS_VISIBLE, \String::encodeIP(), $form->contents, $parsedContents);
		$news->addPost($post);
		$news->incrementPosts();
		return \redirect()->to($news->toSlug('#comments'));
	}
}