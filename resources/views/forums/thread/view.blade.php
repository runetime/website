@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<div class='thread'>
					<div class='row'>
						<div class='col-xs-4 col-sm-3 col-md-2 col-lg-1'>
							{!! \Image::userPhoto($thread->author_id) !!}
						</div>
						<div class='col-xs-8 col-sm-9 col-md-10 col-lg-11'>
							<h1>
								{{$thread->title}}
							</h1>
							by {!!\Link::name($thread->author_id)!!}, {{\Time::shortReadable($thread->created_at)}}
						</div>
					</div>
@if(!empty($thread->tags))
					<ul class='list-inline'>
    @foreach($thread->tags as $tag)
						<li>
							<a href='/forums/tag/{{ $tag->name }}' class='label label-rt' title='{{ $tag->name }}'>
								{{ $tag->name }}
							</a>
						</li>
    @endforeach
					</ul>
@endif
@include('partials._paginator', ['url' => '/forums/thread/' . \String::slugEncode($thread->id, $thread->title)])
@foreach($posts as $post)
	@include('forums.post._show')
@endforeach
				</div>
@if(\Auth::check())
	@if(!$thread->isLocked())
		@include('forums.post._edit', ['url' => '/forums/thread/' . \String::slugEncode($thread->id, $thread->title) . '/reply'])
	@else
		@include('forums.post._locked')
	@endif
@else
	@include('forums.post._auth')
@endif
@include('partials._paginator', ['url' => '/forums/thread/' . \String::slugEncode($thread->id, $thread->title)])
			</div>
@stop