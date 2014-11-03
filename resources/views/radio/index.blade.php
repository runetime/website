@extends('layouts.default')
@section('contents')
			<div id='radio' class='wrapper'>
				<div class='row'>
					<img src='img/radio/header.png' alt='RuneTime Radio' class='img-responsive center-block' />
				</div>
				<br />
				<div class='row'>
					<div id='radio-pull' class='col-xs-12 col-md-0 holo-box-dark invisible'>
						<button id='pull-close' type='button' class='close'>
							<span aria-hidden='true'>
								@lang('radio.close') &times;
							</span>
						</button>
						<div id='pull-contents'>
							&nbsp;
						</div>
					</div>
					<div id='radio-options' class='col-xs-12 col-md-12 holo-box-dark'>
						<div class='row'>
							<div class='col-xs-12 col-md-4 text-center'>
								<h3 class='holo-text'>
									@lang('radio.player.title')
								</h3>
								<h4>
									<a id='radio-link' title='Click here'>@lang('radio.player.click')</a>
								</h4>
								<p id='radio-message'>
									@lang('radio.player.message')
								</p>
								<p>
									@lang('radio.player.status'): <span id='radio-status' class='text-danger'><i id='power-button' class='fa fa-power-off'></i>@lang('radio.player.off')</span>
							</div>
							<div class='col-xs-12 col-md-4 text-center'>
								<h3 class='holo-text'>
									@lang('radio.info.title')
								</h3>
								<div class='row'>
									<div class='col-xs-12 col-md-6'>
										<h4>
											@lang('radio.info.dj.title')
										</h4>
										<p id='radio-dj' class='holo-text-secondary'>
											Auto DJ
										</p>
										<h4>
											@lang('radio.info.song.title')
										</h4>
										<p>
											@lang('radio.info.song.current',['name'=>$song['name'],'artist'=>$song['artist']])
										</p>
									</div>
									<div class='col-xs-12 col-md-6'>
										<h4>
											@lang('radio.info.requests.title')
										</h4>
										<div id='requests-user-current'>
										</div>
									</div>
								</div>
							</div>
							<div class='col-xs-12 col-md-4'>
								<p>
									<a id='radio-history' title='{{Lang::get('radio.options.song_history')}}'>
										@lang('radio.options.song_history')
									</a>
								</p>
								<p>
									<a id='radio-request' title='{{Lang::get('radio.options.request_song')}}'>
										@lang('radio.options.request_song')
									</a>
								</p>
								<p>
									<a id='radio-timetable' title='{{Lang::get('radio.options.view_timetable')}}'>
										@lang('radio.options.dj_timetable')
									</a>
								</p>
@if($isDJ)
								<h3>
									DJ Controls
								</h3>
								<p>
									<a id='radio-dj-requests' title='{{Lang::get('radio.options.view_requests')}}'>
										@lang('radio.options.view_requests')
									</a>
								</p>
								<p>
									<a id='radio-dj-requests' title='{{Lang::get('radio.options.edit_timetable')}}'>
										@lang('radio.options.edit_timetable')
									</a>
								</p>
@endif
							</div>
							<div id='chatbox-holder-radio' class='col-xs-12'>
							</div>
						</div>
					</div>
					<div id='chatbox-holder' class='col-xs-12 holo-box-dark'>
@include('partials.chat')
					</div>
				</div>
			</div>
@stop