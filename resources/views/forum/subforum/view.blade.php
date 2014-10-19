@extends('layouts.forum')
@section('forum')
				<h1>
					{{$subforum->name}}
				</h1>
				<p class='text-muted'>
					{!!$subforum->description!!}
				</p>
				<div class='pull-left'>
				</div>
				<div class='pull-right'>
					<ul class='list-inline'>
						<li>
							<i class='fa fa-check'></i> Mark Read
						</li>
						<li>
							<a href='/forums/create/{{\String::slugEncode($subforum->id,$subforum->name)}}' class='btn btn-primary btn-sm}' role='button'{{!\Auth::check()?' disabled':''}}>
								Start New Topic
							</a>
						</li>
					</ul>
				</div>
				<div class='clearfix'>
				</div>
@if(!empty($subforumList))
	@foreach($subforumList as $subforumItem)
		@include('forum.subforum._subforum', ['subforumItem' => $subforumItem])
	@endforeach
@endif
@if(!empty($threadList))
	@foreach($threadList as $thread)
		@include('forum.subforum._thread', ['thread' => $thread])
	@endforeach
@endif
@stop