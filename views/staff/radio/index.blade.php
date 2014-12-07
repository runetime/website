@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					@lang('staff.radio.title')
				</h1>
				<div class='row row-flat'>
					<div class='col-xs-12 col-sm-4'>
						<h3 class='holo-text text-center'>
							@lang('staff.radio.index.currently_live.title')
						</h3>
@if($live)
	@if($live->id == \Auth::user()->id)
						<p>
							@lang('staff.radio.index.currently_live.you')
						</p>
						<p>
							<a href='/staff/radio/live' class='btn btn-sm btn-success'>
								@lang('staff.radio.index.currently_live.live_panel')
							</a>
						</p>
						<p>
							<a href='/staff/radio/live/stop' class='btn btn-sm btn-info'>
								@lang('staff.radio.index.currently_live.stop')
							</a>
						</p>
	@else
						<p>
							@lang('staff.radio.index.currently_live.current', ['name' => \Link::name($live->id)])
						</p>
	@endif
@else
						<p>
							@lang('staff.radio.index.currently_live.no_one')
						</p>
						<form action='/staff/radio/live' method='post' role='form'>
							<input type='hidden' name='live' value='go' />
							<button type='submit' class='btn btn-sm btn-primary'>
								@lang('staff.radio.index.currently_live.go_live')
							</button>
						</form>
@endif
					</div>
					<div class='col-xs-12 col-sm-4'>
						<h3 class='holo-text text-center'>
							@lang('staff.radio.index.your_messages.title')
						</h3>
@foreach($messages as $message)
						<p>
							{!! $message->contents_parsed !!}
						</p>
@endforeach
						<p>
							<a href='/staff/radio/messages' class='btn btn-sm btn-primary'>
								@lang('staff.radio.index.your_messages.update')
							</a>
						</p>
					</div>
					<div class='col-xs-12 col-sm-4'>
						<h3 class='holo-text text-center'>
							@lang('staff.radio.index.timetable.title')
						</h3>
						<p>
							<a href='/staff/radio/timetable' class='btn btn-sm btn-primary'>
								@lang('staff.radio.index.timetable.title')
							</a>
						</p>
					</div>
				</div>
			</div>
@stop