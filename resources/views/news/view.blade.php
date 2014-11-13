@extends('layouts.default')
@section('contents')
@include('news._show', ['news' => $news])
				<h2 id='comments'>
					Comments
				</h2>
@foreach($posts as $post)
	@include('forums.post._show', ['post' => $post])
@endforeach
@if(\Auth::check())
    @include('forums.post._edit', ['url' => '/news/' . \String::slugEncode($news->id, $news->title) . '/reply'])
@else
	@include('forums.post._auth')
@endif
@stop