@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<div class='thread'>
					<div class='row'>
						<div class='col-xs-4 col-sm-3 col-md-2 col-lg-1'>
							{!!\Image::userPhoto($thread->author_id)!!}
						</div>
						<div class='col-xs-8 col-sm-9 col-md-10 col-lg-11'>
							<h1>
								{{$thread->title}}
							</h1>
							by {!!\Link::name($thread->author_id)!!}, {{\Time::shortReadable($thread->created_at)}}
						</div>
					</div>
@if(strlen(json_decode($thread->tags)[0]) > 0)
					<ul class='list-inline'>
	@foreach(json_decode($thread->tags) as $tag)
						<li>
							<a href='/forums/tag/{{$tag}}' class='label label-rt' title='{{$tag}}'>
								{{$tag}}
							</a>
						</li>
	@endforeach
					</ul>
@endif
@foreach($postList as $post)
	@include('forums.post._show')
@endforeach
				</div>
@if(\Auth::check())
	@if(!$thread->isLocked())
		@include('forums.post._edit', ['id' => $thread->id])
	@else
		@include('forums.post._locked')
	@endif
@else
	@include('forums.post._auth')
@endif
			</div>
@stop