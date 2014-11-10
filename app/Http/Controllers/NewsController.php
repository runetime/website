<?php
namespace App\Http\Controllers;
use App\Http\Requests\NewsForm;
use App\RuneTime\News\News;
use App\RuneTime\News\NewsRepository;
use Illuminate\Contracts\Auth\Guard;
class NewsController extends BaseController {
	protected $auth;
	protected $news;

	/**
	 * @param Guard          $auth
	 * @param NewsRepository $news
	 */
	public function __construct(Guard $auth, NewsRepository $news) {
		$this->auth = $auth;
		$this->news = $news;
	}

	/**
	 * @get("news")
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$news = $this->news->getRecentNews(5);
		$canAdd = false;
		if(\Auth::check())
			$canAdd = \Auth::user()->hasOneOfRoles(1, 2, 4, 6, 8, 10, 12);
		$this->nav('RuneTime');
		$this->title('News');
		return $this->view('news.index', compact('news', 'canAdd'));
	}

	/**
	 * @param $slug
	 * @get("news/{slug}")
	 * @return \Illuminate\View\View
	 */
	public function getView($slug) {
		$news = $this->news->getById(\String::slugDecode($slug)['id']);
		$this->bc(['news' => 'News']);
		$this->nav('News');
		$this->title($news->title);
		$comments = [];
		$tags = "test";
		return $this->view('news.view', compact('news', 'comments', 'tags'));
	}

	/**
	 * @get("news/search/{searchSlug}")
	 */
	public function getSearch() {
	}

	/**
	 * @get("news/create")
	 * @middleware("auth.staff")
	 *
	 * @return \Illuminate\View\View
	 */
	public function getCreate() {
		$this->bc(['news' => 'News']);
		$this->nav('RuneTime');
		$this->title('Create Newspiece');
		return $this->view('news.create.form');
	}

	/**
	 * @middleware("auth.staff")
	 * @post("news/create")
	 *
	 * @param NewsForm $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postCreate(NewsForm $form) {
		$news = new News;
		$news->author_id = \Auth::user()->id;
		$news->title = $form->input('name');
		$news->contents = $form->input('contents');
		$news->status = News::STATUS_PUBLISHED;
		$news->comments = 0;
		$news->save();
		if($form->hasFile('image') && $form->file('image')->isValid()) {
			$form->file('image')->move('./img/news/' . $news->id . '.png');
		}
		return redirect()->action('NewsController@getView', ['slug' => \String::slugEncode($news->id, $news->title)]);
	}
}