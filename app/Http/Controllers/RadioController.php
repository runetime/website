<?php
namespace App\Http\Controllers;
use Illuminate\Contracts\Auth\Authenticator;
class RadioController extends BaseController{
	public function __construct(Authenticator $auth){
		$this->auth=$auth;
	}
	public function getIndex(){
		$dj="Current DJ";
		$song=[
			'artist'=>'Artist',
			'name'=>'Name'
		];
		$isDJ=false;
		if($this->auth->check())
			$isDJ=$this->auth->user()->hasRole('Radio DJ');
		$this->js('radio');
		$this->nav('Radio');
		$this->title='RuneTime Radio';
		return $this->view('radio.index',compact('dj','song','isDJ'));
	}
	public function getHistory(){
		return View::make('radio.request.history');
	}
	public function getTimetable(){
		$hrs=range('0','23');
		$filled[4][17]='Obama';
		$filled[4][18]='Obama';
		$filled[4][19]='Obama';
		$filled[2][15]='Woofy';
		$filled[2][16]='Woofy';
		$page=View::make('radio.request.timetable');
		$page->with('hrs',$hrs);
		$page->with('filled',$filled);
		return $page;
	}
	public function getSong(){
		return View::make('radio.request.song');
	}
	public function getSendRequest($artist,$name){
		if($this->auth->check()){
			$user=$this->auth->id();
		}
		else{
			$user=-1;
		}
		\DB::table('radio_requests')->
			insertGetId([
				'song_artist'=>$artist,
				'song_name'=>$name,
				'requester'=>$user,
				'time_sent'=>time(),
				'ip_address'=>$_SERVER['REMOTE_ADDR'],
				'status'=>0
			]);
		return View::make('radio.send.song');
	}
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