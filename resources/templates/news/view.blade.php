@extends('layouts.default')
@section('contents')
@include('news._show', ['newsPiece' => $news])
				<h2 id='comments'>
					@lang('utilities.comments')
				</h2>
@foreach($posts as $post)
	@include('forums.post._show', ['post' => $post])
@endforeach
@if(\Auth::check())
    @include('forums.post._edit', ['url' => $news->toSlug('reply')])
@else
	@include('forums.post._auth')
@endif
@stop