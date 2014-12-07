@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					{{ $ticket->name }}
				</h1>
				<p>
					@lang('tickets.view.currently', ['status' => ($ticket->status == 0 ? "<span class='text-success'>" . Lang::get('tickets.status.open') . "</span>" : "<span class='text-danger'>" . Lang::get('tickets.status.closed') . "</span>")])
				</p>
@foreach($posts as $post)
	@include('forums.post._show', ['post' => $post])
@endforeach
@if(\Auth::check())
	@if(!$ticket->status == 1)
		@include('forums.post._edit', ['url' => '/tickets/' . \String::slugEncode($ticket->id, $ticket->name) . '/reply'])
	@else
		@include('forums.post._locked')
	@endif
@else
	@include('forums.post._auth')
@endif
			</div>
@stop