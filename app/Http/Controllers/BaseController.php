<?php
namespace App\Http\Controllers;
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
		return \View::make($path, $data);
	}

	/**
	 *
	 */
	private function updateCache() {
		$user = \Request::getClientIp();
		if(\Auth::check())
			$user = \Auth::user()->id;
		$activity = ['url' => \Request::url(), 'time' => time(), 'title' => $this->title];
		$time = \Carbon::now()->addMinutes(15);
		\Cache::put('activity.' . $user, $activity, $time);
	}
}