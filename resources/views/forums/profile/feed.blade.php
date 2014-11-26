@extends('layouts.profile')
@section('profile')
						<h3>
							@lang('forums.profiles.feed.title', ['name' => $profile->display_name])
						</h3>
@foreach($threads as $thread)
	@include('forums.subforum._thread', ['thread' => $thread])
@endforeach
@stop