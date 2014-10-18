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
@if(!empty(json_decode($thread->tags)))
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
@include('forum.post._show')
@endforeach
				</div>
@if(\Auth::check())
@include('forum.post._edit', ['id' => $thread->id])
@endif
			</div>
@stop