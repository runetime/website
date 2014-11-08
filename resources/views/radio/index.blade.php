@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<img src='/img/radio/header.png' alt='RuneTime Radio' class='img-responsive center-block' />
			</div>
			<div id='radio' class='wrapper-dark wrapper-none-res row row-flat'>
				<div id='radio-pull' class='col-xs-12 col-md-0 hidden'>
					<button id='pull-close' type='button' class='close'>
						<span aria-hidden='true'>
							@lang('radio.close') &times;
						</span>
					</button>
					<div id='pull-contents'>
						&nbsp;
					</div>
				</div>
				<div id='radio-options' class='col-xs-12 col-md-12 row text-center'>
					<div class='col-xs-12 col-md-4'>
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
					<div class='col-xs-12 col-md-4'>
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
						<ul class='list-group'>
                            <a id='radio-history' class='list-group-item' title='@lang('radio.options.song_history')'>
                                @lang('radio.options.song_history')
                            </a>
                            <a id='radio-request' class='list-group-item' title='@lang('radio.options.request_song')'>
                                @lang('radio.options.request_song')
                            </a>
                            <a id='radio-timetable' class='list-group-item' title='@lang('radio.options.view_timetable')'>
                                @lang('radio.options.dj_timetable')
                            </a>
					</div>
				</div>
			</div>
			<div class='wrapper-none-res wrapper-dark'>
				<div id='chatbox-holder'>
@include('partials.chat')
				</div>
			</div>
@stop