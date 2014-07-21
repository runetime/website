@extends('layouts.default')
@section('content')
			<div id='radio' class='wrapper'>
				<div class='row text-center'>
					{{HTML::image('img/radio/header.png','RuneTime Radio',['class'=>'img-responsive'])}} 
				</div>
				<br />
				<div class='row'>
					<div id='radio-pull' class='col-xs-12 col-md-1'>
						&nbsp;
					</div>
					<div class='col-xs-12 col-md-11 row holo-box-dark'>
						<div class='col-xs-12 col-md-4'>
							<h3 class='holo-text'>
								Radio Player
							</h3>
							<h4>
								<a id='radio-link' title='Click here'>Click here</a>
							</h4>
							<p id='radio-message'>
								to listen to RuneTime Radio!
							</p>
							<p>
								Status: <span id='radio-status' class='text-danger glyphicon glyphicon-off'>Off</span>
						</div>
						<div class='col-xs-12 col-md-4'>
							<h3 class='holo-text'>
								Information
							</h3>
							<h4>
								Current DJ:
							</h4>
							<p id='radio-dj' class='holo-text-secondary'>
								{{$dj}}
							</p>
							<h4>
								Current Song
							</h4>
							<p>
								<span id='radio-song-name' class='holo-text-secondary'>{{$song['name']}}</span>
								by <span id='radio-song-artist' class='holo-text-secondary'>{{$song['artist']}}</span>
							</p>
						</div>
						<div class='col-xs-12 col-md-4'>
							<p>
								<a id='radio-history' title='View the Song History'>
									Song History
								</a>
							</p>
							<p>
								<a id='radio-request' title='Request a Song From the DJ'>
									Request Song From DJ
								</a>
							</p>
							<p>
								<a id='radio-timetable' title='View the DJ Timetable'>
									DJ Timetable
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>
@stop