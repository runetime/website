@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					{{ $ticket->name }}
				</h1>
				<p>
					This ticket is currently {!! $ticket->status == 0 ? "<span class='text-success'>open</span>" : "<span class='text-danger'>closed</span>" !!}.
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