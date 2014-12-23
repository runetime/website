<?php
namespace App\Http\Controllers;

use App\Http\Requests\Staff\RadioMessageRequest;
use App\Http\Requests\Staff\RadioTimetableRequest;
use App\Http\Requests\Staff\RadioLiveMessage;
use App\Http\Requests\Staff\RadioLiveRequest;
use App\RuneTime\Radio\HistoryRepository;
use App\RuneTime\Radio\Message;
use App\RuneTime\Radio\MessageRepository;
use App\RuneTime\Radio\Session;
use App\RuneTime\Radio\SessionRepository;
use App\RuneTime\Radio\TimetableRepository;
use App\Runis\Accounts\UserRepository;

class StaffRadioController extends BaseController
{
	/**
	 * @var HistoryRepository
	 */
	private $history;
	/**
	 * @var MessageRepository
	 */
	private $messages;
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
	 * @param MessageRepository   $messages
	 * @param SessionRepository   $sessions
	 * @param TimetableRepository $timetable
	 * @param UserRepository      $users
	 */
	public function __construct(HistoryRepository $history, MessageRepository $messages, SessionRepository $sessions, TimetableRepository $timetable, UserRepository $users)
	{
		$this->history = $history;
		$this->messages = $messages;
		$this->sessions = $sessions;
		$this->timetable = $timetable;
		$this->users = $users;
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getRadioIndex()
	{
		$live = \Cache::get('radio.dj.current');
		if($live) {
			$live = $this->users->getById($live);
		}

		$messages = $this->messages->getByUser(\Auth::user()->id);

		$this->bc(['staff' => trans('staff.title')]);
		$this->nav('navbar.staff.staff');
		$this->title('staff.radio.title');
		return $this->view('staff.radio.index', compact('live', 'messages'));
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getRadioLive()
	{
		$messages = $this->messages->getByUser(\Auth::user()->id);

		$this->bc(['staff' => trans('staff.title'), 'staff/radio' => trans('staff.radio.title')]);
		$this->nav('navbar.staff.staff');
		$this->title('staff.radio.live.title');
		return $this->view('staff.radio.live', compact('messages'));
	}

	/**
	 * @param RadioLiveRequest $form
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function postRadioLive(RadioLiveRequest $form)
	{
		if($form->live !== "go") {
			return \App::abort(404);
		}

		$live = \Cache::get('radio.dj.current');
		$user = $this->users->getById($live);
		if(!$user) {
			\Cache::forever('radio.dj.current', \Auth::user()->id);
			with(new Session)->saveNew(\Auth::user()->id, -1, Session::STATUS_PLAYING);
		}

		return \redirect()->to('/staff/radio/live');
	}

	/**
	 * @param RadioLiveMessage $form
	 *
	 * @return string
	 */
	public function postRadioLiveMessage(RadioLiveMessage $form)
	{
		$session = $this->sessions->getByStatus(Session::STATUS_PLAYING);
		$session->message_id = $form->id;
		$session->save();
		header('Content-Type: application/json');

		return json_encode(['message' => $session->message->contents_parsed]);
	}

	/**
	 * @return string
	 */
	public function getRadioLiveUpdate()
	{
		$update = ['song' => ['name' => '', 'artist' => ''], 'message' => '', 'requests' => []];
		$session = $this->sessions->getByStatus(Session::STATUS_PLAYING);
		if($session->message_id !== -1) {
			$update['message'] = $session->message->contents_parsed;
		}

		$song = $this->history->getLatest();
		if($song) {
			$update['song'] = ['name' => $song->song, 'artist' => $song->artist];
		}

		header('Content-Type: application/json');

		return json_encode($update);
	}

	/**
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function getRadioLiveStop()
	{
		$live = \Cache::get('radio.dj.current');
		if($live) {
			if($live === \Auth::user()->id || \Auth::user()->isAdmin()) {
				\Cache::forever('radio.dj.current', null);
				$session = $this->sessions->getByStatus(Session::STATUS_PLAYING);
				if($session) {
					$session->status = Session::STATUS_DONE;
					$session->save();
				}
			}
		}

		return \redirect()->to('/staff/radio');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getRadioMessages()
	{
		$messages = $this->messages->getByUser(\Auth::user()->id);

		$this->bc(['staff' => trans('staff.title'), 'staff/radio' => trans('staff.radio.title')]);
		$this->nav('navbar.staff.staff');
		$this->title(trnas('staff.radio.messages.title'));
		return $this->view('staff.radio.messages', compact('messages'));
	}

	/**
	 * @param RadioMessageRequest $form
	 *
	 * @return string
	 */
	public function postRadioMessages(RadioMessageRequest $form)
	{
		$contentsParsed = with(new \Parsedown)->text($form->contents);
		with(new Message)->saveNew(\Auth::user()->id, $form->contents, $contentsParsed);

		return \redirect()->to('/staff/radio/messages');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getRadioTimetable()
	{
		$timetable = $this->timetable->getThisWeek();
		$days = [];
		$x = 0;
		foreach($timetable as $time) {
			if($time->dj_id > 0) {
				$days[$x][$time->hour] = $this->users->getById($time->dj_id)->display_name;
			} else {
				$days[$x][$time->hour] = $time->dj_id;
			}

			if($time->hour == 23) {
				$x++;
			}
		}

		$this->bc(['staff' => trans('staff.title'), 'staff/radio' => trans('staff.radio.title')]);
		$this->nav('navbar.staff.staff');
		$this->title('staff.radio.timetable.title');
		return $this->view('staff.radio.timetable', compact('days'));
	}

	/**
	 * @param RadioTimetableRequest $form
	 *
	 * @return string
	 */
	public function postRadioTimetable(RadioTimetableRequest $form)
	{
		$timeStart = strtotime('last tuesday 00:00:00', strtotime('tomorrow'));
		$dayStart = date('z', $timeStart);
		$dayStart += $form->day;
		$hour = $this->timetable->getByHourDay($form->hour, $dayStart);
		if($hour) {
			$response = ['valid' => true, 'hour' => $form->hour, 'day' => $form->day];
			if($hour->dj_id == -1) {
				$response['name'] = \Auth::user()->display_name;
				$hour->dj_id = \Auth::user()->id;
			} elseif($hour->dj_id == \Auth::user()->id) {
				$response['name'] = '-';
				$hour->dj_id = -1;
			}

			$hour->save();
		} else {
			$response = ['valid' => false];
		}

		header('Content-Type: application/json');

		return json_encode($response);
	}
}