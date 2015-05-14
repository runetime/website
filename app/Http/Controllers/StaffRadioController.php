<?php
namespace App\Http\Controllers;

use App\Http\Requests\Staff\RadioLiveMessage;
use App\Http\Requests\Staff\RadioLiveRequest;
use App\Http\Requests\Staff\RadioMessageRequest;
use App\Http\Requests\Staff\RadioRequestAnswerRequest;
use App\Http\Requests\Staff\RadioTimetableRequest;
use App\RuneTime\Accounts\UserRepository;
use App\RuneTime\Radio\HistoryRepository;
use App\RuneTime\Radio\Message;
use App\RuneTime\Radio\MessageRepository;
use App\RuneTime\Radio\Request;
use App\RuneTime\Radio\RequestRepository;
use App\RuneTime\Radio\Session;
use App\RuneTime\Radio\SessionRepository;
use App\RuneTime\Radio\TimetableRepository;

/**
 * Class StaffRadioController
 */
class StaffRadioController extends Controller
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
     * @param MessageRepository   $messages
     * @param RequestRepository   $requests
     * @param SessionRepository   $sessions
     * @param TimetableRepository $timetable
     * @param UserRepository      $users
     */
    public function __construct(
        HistoryRepository $history,
        MessageRepository $messages,
        RequestRepository $requests,
        SessionRepository $sessions,
        TimetableRepository $timetable,
        UserRepository $users)
    {
        $this->history = $history;
        $this->messages = $messages;
        $this->requests = $requests;
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
        if ($live) {
            $live = $this->users->getById($live);
        }

        $messages = $this->messages->getByUser(\Auth::user()->id);

        $this->bc(['staff' => trans('staff.title')]);
        $this->nav('navbar.staff.title');
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
        $this->nav('navbar.staff.title');
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
        if ($form->live !== 'go') {
            return \Error::abort(404);
        }

        $live = \Cache::get('radio.dj.current');
        $user = $this->users->getById($live);
        if (empty($user)) {
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

        return json_encode(['message' => $session->message->contents_parsed]);
    }

    /**
     * @return string
     */
    public function getRadioLiveUpdate()
    {
        $update = [
            'song' => [
                'name'   => '',
                'artist' => '',
            ],
            'message'  => '',
            'requests' => [],
        ];
        $session = $this->sessions->getByStatus(Session::STATUS_PLAYING);
        if ($session->message_id !== -1) {
            $update['message'] = $session->message->contents_parsed;
        }

        $song = $this->history->getLatest();
        if (!empty($song)) {
            $update['song'] = ['name' => $song->song, 'artist' => $song->artist];
        }

        $since = $session->created_at->timestamp;
        $requests = $this->requests->getByTime($since);
        foreach ($requests as $request) {
            if ($request->created_at->timestamp > $since) {
                $rData = new \stdClass;
                $rData->author_name = $request->author->display_name;
                $rData->id = $request->id;
                $rData->song_artist = $request->song_artist;
                $rData->song_name = $request->song_name;
                $rData->status = $request->status;
                array_push($update['requests'], $rData);
            }
        }

        return json_encode($update);
    }

    /**
     * @return \Illuminate\Http\RedirectResponse
     */
    public function getRadioLiveStop()
    {
        $live = \Cache::get('radio.dj.current');
        if ($live && ($live === \Auth::user()->id || \Auth::user()->isAdmin())) {
            \Cache::forever('radio.dj.current', null);
            Session::truncate();
            Request::truncate();
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
        $this->nav('navbar.staff.title');
        $this->title('staff.radio.messages.title');

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
     * @param RadioRequestAnswerRequest $form
     *
     * @return string
     */
    public function postRadioRequest(RadioRequestAnswerRequest $form)
    {
        $response = ['done' => false];

        $request = $this->requests->getById($form->id);
        $request->status = $form->status;
        $request->save();

        if ($request->status === $form->status) {
            $response['done'] = true;
        }

        return json_encode($response);
    }

    /**
     * @return \Illuminate\View\View
     */
    public function getRadioTimetable()
    {
        $timetable = $this->timetable->getThisWeek();
        $days = [];
        $x = 0;
        foreach ($timetable as $time) {
            if ($time->dj_id > 0) {
                $days[$x][$time->hour] = $this->users->getById($time->dj_id)->display_name;
            } else {
                $days[$x][$time->hour] = $time->dj_id;
            }

            if ($time->hour == 23) {
                $x++;
            }
        }

        $this->bc(['staff' => trans('staff.title'), 'staff/radio' => trans('staff.radio.title')]);
        $this->nav('navbar.staff.title');
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
        if (!empty($hour)) {
            $response = ['valid' => true, 'hour' => $form->hour, 'day' => $form->day];
            if ($hour->dj_id == -1) {
                $response['name'] = \Auth::user()->display_name;
                $hour->dj_id = \Auth::user()->id;
            } elseif ($hour->dj_id == \Auth::user()->id) {
                $response['name'] = '-';
                $hour->dj_id = -1;
            }

            $hour->save();
        } else {
            $response = ['valid' => false];
        }

        return json_encode($response);
    }
}
