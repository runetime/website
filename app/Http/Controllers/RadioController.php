<?php
namespace App\Http\Controllers;
use App\Http\Requests\Radio\RequestSong;
use App\RuneTime\Radio\HistoryRepository;
use App\RuneTime\Radio\Request;
use App\RuneTime\Radio\RequestRepository;
use App\RuneTime\Radio\TimetableRepository;
use App\Runis\Accounts\UserRepository;
/**
 * Class RadioController
 * @package App\Http\Controllers
 */
class RadioController extends BaseController {
	/**
	 * @var HistoryRepository
	 */
	private $history;
	/**
	 * @var RequestRepository
	 */
	private $requests;
	/**
	 * @var UserRepository
	 */
	private $users;
	/**
	 * @var TimetableRepository
	 */
	private $timetable;

	/**
	 * @param HistoryRepository $history
	 * @param RequestRepository $requests
	 * @param UserRepository    $users
	 */
	public function __construct(HistoryRepository $history, RequestRepository $requests, TimetableRepository $timetable, UserRepository $users) {
		$this->history = $history;
		$this->requests = $requests;
		$this->users = $users;
		$this->timetable = $timetable;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$this->js('radio');
		$this->nav('navbar.radio');
		$this->title('RuneTime ' . trans('navbar.radio'));
		return $this->view('radio.index');
	}

	/**
	 * @return mixed
	 */
	public function getHistory() {
		$history = $this->history->getRecentX()->toArray();
		foreach($history as $key => $value)
			$history[$key]['created_at'] = \Time::getEpoch($value['created_at']);
		header('Content-Type: application/json');
		return json_encode($history);
	}

	/**
	 * @return mixed
	 */
	public function getTimetable() {
		$timetable = $this->timetable->getThisWeek();
		$days = [];
		$x = 0;
		foreach($timetable as $time) {
			if($time->dj_id > 0)
				$days[$x][$time->hour] = $this->users->getById($time->dj_id)->display_name;
			else
				$days[$x][$time->hour] = "-";
			if($time->hour == 23)
				$x++;
		}
		header('Content-Type: application/json');
		return json_encode($days);
	}

	/**
	 * @return mixed
	 */
	public function getRequest() {
		header('Content-Type: application/json');
		if(\Auth::check())
			return json_encode(['response' => true]);
		return json_encode(['response' => false]);
	}

	/**
	 * @param RequestSong $form
	 *
	 * @return string
	 */
	public function postRequest(RequestSong $form) {
		$request = new Request;
		$request->saveNew(\Auth::user()->id, $form->artist, $form->name, \Request::getClientIp(true), Request::STATUS_NEUTRAL);
		header('Content-Type: application/json');
		return json_encode(['sent' => true]);
	}

	/**
	 * @return string
	 */
	public function getUpdate() {
		$song = $this->history->getLatest();
		$update = ['requests' => [], 'song' => ['name' => '', 'artist' => ''], 'dj' => ''];
		if(!empty($song)) {
			$update['song']['name'] = $song->song;
			$update['song']['artist'] = $song->artist;
		}
		if(\Cache::get('radio.dj.current') !== null) {
			$user = $this->users->getById(\Cache::get('radio.dj.current'));
			if($user)
				$update['dj'] = $user->display_name;
		}
		if(\Auth::check())
			$update['requests'] = $this->requests->getByUser(\Auth::user()->id);
		header('Content-Type: application/json');
		return json_encode($update);
	}
}