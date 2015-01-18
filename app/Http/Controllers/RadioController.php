<?php
namespace App\Http\Controllers;

use App\Http\Requests\Radio\RequestSong;
use App\RuneTime\Radio\HistoryRepository;
use App\RuneTime\Radio\Request;
use App\RuneTime\Radio\RequestRepository;
use App\RuneTime\Radio\Session;
use App\RuneTime\Radio\SessionRepository;
use App\RuneTime\Radio\TimetableRepository;
use App\RuneTime\Accounts\UserRepository;

class RadioController extends Controller
{
	/**
	 * @var HistoryRepository
	 */
	private $history;
	/**
	 * @var RequestRepository
	 */
	private $requests;
	/**
	 * @var SessionRepository
	 */
	private $sessions;
	/**
	 * @var TimetableRepository
	 */
	private $timetable;
	/**
	 * @var UserRepository
	 */
	private $users;

	/**
	 * @param HistoryRepository   $history
	 * @param RequestRepository   $requests
	 * @param SessionRepository   $sessions
	 * @param TimetableRepository $timetable
	 * @param UserRepository      $users
	 */
	public function __construct(HistoryRepository $history, RequestRepository $requests, SessionRepository $sessions, TimetableRepository $timetable, UserRepository $users)
	{
		$this->history = $history;
		$this->requests = $requests;
		$this->sessions = $sessions;
		$this->timetable = $timetable;
		$this->users = $users;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex()
	{
		$this->nav('navbar.radio');
		$this->title('radio.title');
		return $this->view('radio');
	}

	/**
	 * @return mixed
	 */
	public function getHistory()
	{
		$historySet = $this->history->getRecentX();
		$history = [];
		foreach($historySet as $x => $value) {
			$history[$x] = [];
			$history[$x]['created_at'] = $value->created_at->timestamp;
			$history[$x]['artist'] = $value->artist;
			$history[$x]['song'] = $value->song;
		}

		return json_encode($history);
	}

	/**
	 * @return mixed
	 */
	public function getTimetable()
	{
		$timetable = $this->timetable->getThisWeek();
		$days = [];
		$x = 0;
		foreach($timetable as $time) {
			if($time->dj_id > 0) {
				$days[$x][$time->hour] = $this->users->getById($time->dj_id)->display_name;
			} else {
				$days[$x][$time->hour] = "-";
			}

			if($time->hour == 23) {
				$x++;
			}
		}

		return json_encode($days);
	}

	/**
	 * @return mixed
	 */
	public function getRequest()
	{
		$response = ['response' => 0];
		if(\Auth::check()) {
			$response['response'] = 2;
		}

		$session = $this->sessions->getByStatus(Session::STATUS_PLAYING);
		if(empty($session)) {
			$response['response'] = 1;
		}

		return json_encode($response);
	}

	/**
	 * @param RequestSong $form
	 *
	 * @return string
	 */
	public function postRequest(RequestSong $form)
	{
		$response = ['sent' => false];

		$request = with(new Request)->saveNew(\Auth::user()->id, $form->artist, $form->name, \Request::getClientIp(true), Request::STATUS_NEUTRAL);

		if(!empty($request)) {
			$response['sent'] = true;
		}

		return json_encode($response);
	}

	/**
	 * @return string
	 */
	public function getUpdate()
	{
		$song = $this->history->getLatest();
		$update = [
			'requests' => [],
			'song' => [
				'name' => '',
				'artist' => ''
			],
			'dj' => '',
			'message' => '',
			'online' => true
		];
		if(!empty($song)) {
			$update['song']['name'] = $song->song;
			$update['song']['artist'] = $song->artist;
		}

		$session = $this->sessions->getByStatus(Session::STATUS_PLAYING);
		if(!empty($session)) {
			if($session->message_id > 0) {
				$update['message'] = $session->message->contents_parsed;
			}

			$user = $this->users->getById($session->dj->id);
			if(!empty($user)) {
				$update['dj'] = $user->display_name;
			}
		}

		if(empty($session->message)) {
			$update['message'] = -1;
		}

		if(\Auth::check()) {
			$session = $this->sessions->getByStatus(Session::STATUS_PLAYING);
			if($session) {
				$update['requests'] = $this->requests->getByUserAndTime(
					\Auth::user()->id,
					$session->created_at->timestamp,
					'>='
				);
			}
		}

		$online = \Cache::get('radio.online');
		if($online === true || $online === false) {
			$update['online'] = (bool) $online;
		} else {
			\Cache::forever('radio.online', true);
		}

		return json_encode($update);
	}
}