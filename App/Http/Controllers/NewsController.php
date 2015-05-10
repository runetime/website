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

/**
 * Class NewsController
 * @package App\Http\Controllers
 */
class NewsController extends Controller
{
	/**
	 * @var Guard
	 */
	private $auth;
	/**
	 * @var NewsRepository
	 */
	private $news;
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
	 * @param string $tag
	 *
	 * @return \Illuminate\View\View
	 */
	public function getView($tag = '')
	{

		if(strlen($tag) > 0) {
			$tag = $this->tags->getByName($tag);
			$news = $tag->news;
		} else {
			$news = $this->news->getRecentCanView(5);
		}

		$this->nav('navbar.runetime.title');
		$this->title('news.title');
		return $this->view('news.index', compact('news', 'tag'));
	}

	/**
	 * @param      $id
	 * @param bool $comments
	 *
	 * @return \Illuminate\View\View
	 */
	public function getArticle($id, $comments = false)
	{
		$news = $this->news->getById($id);

		if(empty($news)) {
			return \Error::abort(404);
		}

		$news = $this->news->getXSkipFrom(5, $id);

		$this->nav('navbar.runetime.title');
		$this->title('news.title');
		return $this->view('news.index', compact('news', 'comments', 'id'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getCreate()
	{
		$this->bc(['news' => trans('news.title')]);
		$this->nav('navbar.runetime.title');
		$this->title('news.create_newspiece');
		return $this->view('news.create');
	}

	/**
	 * @param CreateNewsRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postCreate(CreateNewsRequest $form)
	{
		$contentsParsed = with(new \Parsedown)->text($form->contents);
		$news = with(new News)->saveNew(\Auth::user()->id, $form->name, $form->contents, $contentsParsed, 0, News::STATUS_PUBLISHED);
		if(\Request::hasFile('image')) {
			\Img::make($form->file('image'))->save('./img/news/' . $news->id . '.png');
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
			if(empty($tag)) {
				$tag = with(new Tag)->saveNew(\Auth::user()->id, $tagName);
			} else {
				$tag = $this->tags->getByName($tagName);
			}

			$news->addTag($tag);
		}

		if(!empty($tag)) {
			return \redirect()->to($tag->toNews());
		} else {
			return \redirect()->to('news');
		}
	}

	/**
	 * @param              $id
	 * @param ReplyRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postReply($id, ReplyRequest $form)
	{
		$response = ['done' => false];

		$news = $this->news->getById($id);
		if(empty($news)) {
			return \Error::abort(404);
		}

		$parsedContents = with(new \Parsedown)->text($form->contents);
		$post = with(new Post)->saveNew(\Auth::user()->id, 0, Post::STATUS_VISIBLE, \String::encodeIP(), $form->contents, $parsedContents);
		$news->addPost($post);
		$news->incrementPosts();

		if(!empty($news)) {
			$response['done'] = true;
			$response['url'] = $news->toSlug('comments');
		}

		return json_encode($response);
	}
}