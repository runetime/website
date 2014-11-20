<?php
namespace App\Http\Controllers;
use App\RuneTime\Bans\IP;
use App\RuneTime\Bans\IPRepository;
use Illuminate\Routing\Controller;
use Illuminate\Contracts\Auth\Guard;
class BaseController extends Controller {
	protected $bc;
	protected $displayPageHeader = true;
	protected $js;
	protected $nav;
	protected $title = '';

	/**
	 * @param array $breadcrumbs
	 */
	protected function bc($breadcrumbs = []) {
		if($breadcrumbs == false)
			$this->displayPageHeader = false;
		else
			$this->bc = $breadcrumbs;
	}

	/**
	 * @param $js
	 */
	protected function js($js) {
		$this->js = $js;
	}

	/**
	 * @param $nav
	 */
	protected function nav($nav) {
		$locale = \Cache::get('ip.' . \Request::getClientIp() . '.lang');
		if(empty($locale))
			\Cache::forever('ip.' . \Request::getClientIp() . '.lang', 'en');
		$locale = \Cache::get('ip.' . \Request::getClientIp() . '.lang');
		\Lang::setLocale($locale);
		$this->nav = trans($nav);
	}

	/**
	 *
	 */
	protected function setupLayout() {
		if(!is_null($this->layout))
			$this->layout = \View::make($this->layout);
	}

	/**
	 * @param $newTitle
	 */
	protected function title($newTitle) {
		if(!empty($newTitle))
			$this->title = $newTitle;
	}

	/**
	 * @param       $path
	 * @param array $data
	 *
	 * @return \Illuminate\View\View
	 */
	protected function view($path, $data = []) {
		$data['bc'] = $this->bc;
		$data['displayPageHeader'] = $this->displayPageHeader;
		$data['js'] = $this->js;
		$data['nav'] = $this->nav;
		$data['title'] = $this->title;
		$data['url'] = \Request::getPathInfo();
		$this->updateCache();
		$bans = new IPRepository(new IP);
		if($bans->getByIP(\Request::getClientIp())) {
			return \View::make('errors.banned', $data);
		}
		return \View::make($path, $data);
	}

	/**
	 *
	 */
	private function updateCache() {
		$current = [
			'url' => \Request::url(),
			'time' => \Carbon::createFromTimestamp(time()),
			'title' => $this->title,
			'logged' => \Auth::check()
		];
		$activity = \Cache::get('activity.users');
		if(empty($activity))
			$activity = [];
		if(\Auth::check())
			$current['user'] = \Auth::user()->id;
		else
			$current['user'] = \Request::getClientIp();
		$ago = \Carbon::now()->subMinutes(30)->timestamp;
		foreach($activity as $key => $value) {
			if(ceil($key / 1000) <= $ago)
				unset($activity[$key]);
			if((\Auth::check() && $value['user'] === \Auth::user()->id) || $value['user'] === \Request::getClientIp())
				unset($activity[$key]);
		}
		$activity[microtime(true) * 1000] = $current;
		$most = \Cache::get('activity.most');
		$activeCount = count($activity);
		if($activeCount > $most)
			\Cache::forever('activity.most', $activeCount);
		\Cache::forever('activity.users', $activity);
	}
}