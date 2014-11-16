@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Radio Panel
				</h1>
				<div class='row row-flat'>
					<div class='col-xs-12 col-sm-4'>
						<h3 class='holo-text text-center'>
							Currently Live
						</h3>
@if($live)
	@if($live->id == \Auth::user()->id)
						<p>
							You are currently live.
						</p>
						<p>
							<a href='/staff/radio/live' class='btn btn-sm btn-success'>
								Live Panel
							</a>
						</p>
						<p>
							<a href='/staff/radio/live/stop' class='btn btn-sm btn-info'>
								Stop DJing
							</a>
						</p>
	@else
						<p>
							{!! \Link::name($live->id) !!} is currently live.
						</p>
	@endif
@else
						<p>
							No one is currently live.
						</p>
						<form action='/staff/radio/live' method='post' role='form'>
							<input type='hidden' name='live' value='go' />
							<button type='submit' class='btn btn-sm btn-primary'>
								Go Live
							</button>
						</form>
@endif
					</div>
					<div class='col-xs-12 col-sm-4'>
						<h3 class='holo-text text-center'>
							Your Messages
						</h3>
@foreach($messages as $message)
						<p>
							{!! $message->contents_parsed !!}
						</p>
@endforeach
						<p>
							<a href='/staff/radio/messages' class='btn btn-sm btn-primary'>
								Update Messages
							</a>
						</p>
					</div>
					<div class='col-xs-12 col-sm-4'>
						<h3 class='holo-text text-center'>
							Timetable
						</h3>
						<p>
							<a href='/staff/radio/timetable' class='btn btn-sm btn-primary'>
								Update Timetable
							</a>
						</p>
					</div>
				</div>
			</div>
@stop