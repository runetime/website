@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					{{ $tag->name }}
				</h1>
@foreach($threads as $thread)
	@include('forums.subforum._thread', ['thread' => $thread])
@endforeach
			</div>
@stop