@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					{{$tag->name}} 
				</h1>
@foreach($threadList as $thread)
	@include('forum.subforum._thread', ['thread' => $thread])
@endforeach
			</div>
@stop