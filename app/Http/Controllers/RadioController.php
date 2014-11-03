<?php
namespace App\Http\Controllers;
use App\RuneTime\Radio\RequestRepository;
use Illuminate\Contracts\Auth\Guard;
class RadioController extends BaseController {
	/**
	 * @param Guard             $auth
	 * @param RequestRepository $requests
	 */
	public function __construct(Guard $auth, RequestRepository $requests) {
		$this->requests = $requests;
		$this->auth = $auth;
	}

	/**
	 * @get("radio")
	 *
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$dj = "Current DJ";
		$song = ['artist' => 'Artist', 'name' => 'Name'];
		$isDJ = false;
		if($this->auth->check())
			$isDJ = $this->auth->user()->hasRole('Radio DJ');
		$this->js('radio');
		$this->nav('navbar.radio');
		$this->title('RuneTime ' . trans('navbar.radio'));
		return $this->view('radio.index', compact('dj', 'song', 'isDJ'));
	}

	/**
	 * @get("radio/request/history")
	 *
	 * @return \Illuminate\View\View
	 */
	public function getHistory() {
		return \View::make('radio.request.history');
	}

	/**
	 * @get("radio/request/timetable")
	 *
	 * @return \Illuminate\View\View
	 */
	public function getTimetable() {
		$hrs = range('0', '23');
		$filled[4][17] = 'Obama';
		$filled[4][18] = 'Obama';
		$filled[4][19] = 'Obama';
		$filled[2][15] = 'Woofy';
		$filled[2][16] = 'Woofy';
		$page = \View::make('radio.request.timetable');
		$page->with('hrs', $hrs);
		$page->with('filled', $filled);
		return $page;
	}

	/**
	 * @get("radio/request/song")
	 * @return \Illuminate\View\View
	 */
	public function getSong() {
		return \View::make('radio.request.song');
	}

	/**
	 * @get("radio/send/request/{artist}/{name}")
	 * @middleware("auth.logged")
	 *
	 * @param $artist
	 * @param $name
	 *
	 * @return mixed
	 */
	public function getSendRequest($artist, $name) {
		if($this->auth->check()) {
			$user = $this->auth->id();
		} else {
			$user = -1;
		}
		\DB::table('radio_requests')->insertGetId(['song_artist' => $artist, 'song_name' => $name, 'requester' => $user, 'time_sent' => time(), 'ip_address' => $_SERVER['REMOTE_ADDR'], 'status' => 0]);
		return \View::make('radio.send.song');
	}

	/**
	 * @get("radio/update")
	 *
	 * @return string
	 */
	public function getUpdate() {
		if($this->auth->check())
			$requests = $this->requests->getBySession($this->auth->user()->id); else
			$requests = $this->requests->getBySession(\Request::getClientIp());
		return json_encode($currentRequests);
	}

	/**
	 * @return string
	 */
	public function getRequestsCurrent(){
		if($this->auth->check())
			$user=$this->auth->id();
		else
			$user=-1;
		$currentRequests=\DB::table('radio_requests')->
		where('requester',$user)->
		where(function($q){
				if($this->auth->check()){
					$q->where('requester',$this->auth->id())->
					where('time_sent','>',time()-600);
				}
				else{
					$q->where('requester','-1')->
					where('ip_address',$_SERVER['REMOTE_ADDR'])->
					where('status','=',0)->
					orWhere(function($query){
							$query->where('requester','-1')->
							where('ip_address',$_SERVER['REMOTE_ADDR'])->
							where('status','>',0)->
							where('time_sent','>',time()-600);
						});
				}
			})->
		get();
		return json_encode($currentRequests);
	}
}