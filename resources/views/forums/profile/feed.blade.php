@extends('layouts.profile')
@section('profile')
						<h3>
							Recent Threads by {{ $profile->display_name }}
						</h3>
@foreach($threads as $thread)
	@include('forums.subforum._thread', ['thread' => $thread])
@endforeach
@stop