<?php
namespace App\Http\Controllers;
use App\Http\Requests\Radio\RequestSong;
use App\RuneTime\Radio\HistoryRepository;
use App\RuneTime\Radio\Request;
use App\RuneTime\Radio\RequestRepository;
use App\RuneTime\Radio\Session;
use App\RuneTime\Radio\SessionRepository;
use App\RuneTime\Radio\TimetableRepository;
use App\RuneTime\Statuses\StatusRepository;
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
	 * @var SessionRepository
	 */
	private $sessions;

	/**
	 * @param HistoryRepository   $history
	 * @param RequestRepository   $requests
	 * @param SessionRepository   $sessions
	 * @param TimetableRepository $timetable
	 * @param UserRepository      $users
	 */
	public function __construct(HistoryRepository $history, RequestRepository $requests, SessionRepository $sessions, TimetableRepository $timetable, UserRepository $users) {
		$this->history = $history;
		$this->requests = $requests;
		$this->users = $users;
		$this->timetable = $timetable;
		$this->sessions = $sessions;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$this->nav('navbar.radio');
		$this->title('RuneTime ' . trans('navbar.radio'));
		return $this->view('radio.index');
	}

	/**
	 * @return mixed
	 */
	public function getHistory() {
		$historySet = $this->history->getRecentX();
		$history = [];
		foreach($historySet as $x => $value) {
			$history[$x] = [];
			$history[$x]['created_at'] = $value->created_at->timestamp;
			$history[$x]['artist'] = $value->artist;
			$history[$x]['song'] = $value->song;
		}
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
		$response = ['response' => 0];
		if(\Auth::check())
			$response['response'] = 2;
		$session = $this->sessions->getByStatus(Session::STATUS_PLAYING);
		if(empty($session))
			$response['response'] = 1;
		return $response;
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
		$update = ['requests' => [], 'song' => ['name' => '', 'artist' => ''], 'dj' => '', 'message' => ''];
		if(!empty($song)) {
			$update['song']['name'] = $song->song;
			$update['song']['artist'] = $song->artist;
		}
		$session = $this->sessions->getByStatus(Session::STATUS_PLAYING);
		if($session) {
			if($session->message)
				$update['message'] = $session->message->contents_parsed;
			$user = $this->users->getById($session->dj->id);
			if($user)
				$update['dj'] = $user->display_name;
		}
		if(\Auth::check())
			$update['requests'] = $this->requests->getByUser(\Auth::user()->id);
		header('Content-Type: application/json');
		return json_encode($update);
	}
}