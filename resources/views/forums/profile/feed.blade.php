@extends('layouts.profile')
@section('profile')
						<h3>
							@lang('profile.feed.recent_threads', ['name' => $profile->display_name])
						</h3>
@foreach($threads as $thread)
	@include('forums.subforum._thread', ['thread' => $thread])
@endforeach
@stop