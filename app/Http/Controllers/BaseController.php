<?php
namespace App\Http\Controllers;

use App\RuneTime\Bans\Ban;
use App\RuneTime\Bans\BanRepository;
use App\RuneTime\Bans\IP;
use App\RuneTime\Bans\IPRepository;
use Illuminate\Routing\Controller;

class BaseController extends Controller
{
	protected $bc = [];
	protected $displayPageHeader = true;
	protected $nav = '';
	protected $title = '';

	/**
	 * @param array $breadcrumbs
	 */
	protected function bc($breadcrumbs = [])
	{
		if($breadcrumbs === false) {
			$this->displayPageHeader = false;
		} else {
			$this->bc = $breadcrumbs;
		}
	}

	/**
	 * @param $nav
	 */
	protected function nav($nav)
	{
		$locale = \Cache::get('ip.' . \Request::getClientIp() . '.lang');

		if(empty($locale)) {
			\Cache::forever('ip.' . \Request::getClientIp() . '.lang', 'en');
			$locale = \Cache::get('ip.' . \Request::getClientIp() . '.lang');
		}

		\Lang::setLocale($locale);
		$this->nav = trans($nav);
	}

	/**
	 *
	 */
	protected function setupLayout()
	{
		if(is_null($this->layout) === false) {
			$this->layout = \View::make($this->layout);
		}
	}

	/**
	 * @param       $lang
	 * @param array $data
	 */
	protected function title($lang, $data = [])
	{
		$this->title = trans($lang, $data);
	}

	/**
	 * @param       $path
	 * @param array $data
	 *
	 * @return \Illuminate\View\View
	 */
	protected function view($path, $data = [])
	{
		$data['bc'] = $this->bc;
		$data['displayPageHeader'] = $this->displayPageHeader;
		$data['nav'] = $this->nav;
		$data['title'] = $this->title;
		$data['url'] = \Request::getPathInfo();
		if(\Auth::check()) {
			\Auth::user()->last_active = time();
			\Auth::user()->save();
		}

		if(\Auth::check()) {
			$bans = new BanRepository(new Ban);
			$ban = $bans->getByUserId(\Auth::user()->id);
			if(!empty($ban)) {
				$data['ban'] = $ban;
				$data['bc'] = false;
				$data['displayPageHeader'] = false;
				$data['nav'] = 'navbar.home';
				$data['time'] = \Carbon::createFromTimestamp($ban->time_ends)->diffForHumans();
				$data['title'] = trans('navbar.home');
				return \View::make('errors.banned', $data);
			}
		}

		$ipBans = new IPRepository(new IP);
		$ipBan = $ipBans->getByIPActive(\Request::getClientIp());
		if(!empty($ipBan)) {
			if(\Auth::check()) {
				\Auth::logout();
			}
			$data['ban'] = $ipBan;
			$data['bc'] = false;
			$data['displayPageHeader'] = false;
			$data['nav'] = 'navbar.home';
			$data['title'] = trans('navbar.home');
			return \View::make('errors.ip_banned', $data);
		}

		$this->updateCache();
		return \View::make($path, $data);
	}

	/**
	 *
	 */
	private function updateCache()
	{
		if(\Request::getClientIp() === "127.0.0.1") {
			return;
		}

		$current = [
			'url'    => \Request::url(),
			'time'   => \Carbon::createFromTimestamp(time()),
			'title'  => $this->title,
			'logged' => \Auth::check()
		];
		$activity = \Cache::get('activity.users');
		if(empty($activity)) {
			$activity = [];
		}

		if(\Auth::check()) {
			$current['user'] = \Auth::user()->id;
		} else {
			$current['user'] = \Request::getClientIp();
		}

		$ago = \Carbon::now()->subMinutes(30)->timestamp;
		foreach($activity as $key => $value) {
			if(ceil($key / 1000) <= $ago) {
				unset($activity[$key]);
			}

			if((\Auth::check() && $value['user'] === \Auth::user()->id) || $value['user'] === \Request::getClientIp()) {
				unset($activity[$key]);
			}
		}

		$activity[microtime(true) * 1000] = $current;
		$most = \Cache::get('activity.most');
		$activeCount = count($activity);
		if($activeCount > $most) {
			\Cache::forever('activity.most', $activeCount);
		}

		\Cache::forever('activity.users', $activity);
	}
}