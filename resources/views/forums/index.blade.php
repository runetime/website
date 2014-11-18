@extends('layouts.default')
@section('contents')
			<div class='wrapper wrapper-flat'>
				<br />
				<div class='row row-flat'>
					<div class='col-xs-12 col-md-9'>
@if(!empty($subforumList[-1]))
@foreach($subforumList[-1] as $subforums)
	@if(empty(json_decode($subforums->roles)) || Auth::check() && in_array(\Auth::user()->importantRole()->id, json_decode($subforums->roles)))
						<h3>
							<a href='/forums/{{ \String::slugEncode($subforums->id,$subforums->name) }}' title='{{ $subforums->name }}'>
								{{ $subforums->name }}
							</a>
						</h3>
		@foreach($subforumList[$subforums->id] as $subforum)
			@if(empty(json_decode($subforum->roles)) || \Auth::check() && in_array(\Auth::user()->importantRole()->id, json_decode($subforum->roles)))
				@include('forums.subforum._subforum', ['subforumItem' => $subforum])
			@endif
		@endforeach
	@endif
@endforeach
@endif
					</div>
					<div class='col-xs-12 col-md-3'>
						<h3>
							@lang('forums.sidebar.recent_threads.name')
						</h3>
@if(!empty($recentThreads))
	@foreach($recentThreads as $thread)
						<div class='card'>
							{!! \Image::userPhoto($thread->author_id, ['photo-sm', 'pull-left']) !!}
							<a href='/forums/thread/{{ \String::slugEncode($thread->id, $thread->title) }}' title='{{ $thread->title }}'>
								{{ $thread->title }}
							</a>
							<br />
							{!! \Link::name($thread->author_id) !!}, <span class='text-muted'>{{ \Time::shortReadable($thread->created_at) }}</span>
						</div>
	@endforeach
@endif
						<h3>
							@lang('forums.sidebar.recent_posts.name')
						</h3>
@if(!empty($recentPosts))
	@foreach($recentPosts as $post)
						<div class='card'>
							{!! \Image::userPhoto($post->author_id, ['photo-sm', 'pull-left']) !!}
							<a href='/forums/thread/{{ \String::slugEncode($post->thread[0]->id, $post->thread[0]->title) }}' title='{{ $post->thread[0]->title }}'>
								{{ $post->thread[0]->title }}
							</a>
							<br />
							{!! \Link::name($post->author_id) !!}, <span class='text-muted'>{{ \Time::shortReadable($post->created_at) }}</span>
						</div>
	@endforeach
@endif
					</div>
					<div class='col-xs-12 text-center'>
						<ul class='list-inline'>
							<li>
								<span class='label label-dark'>{{ $forumInfo['posts'] }}</span> @lang('forums.bar.total_posts')
							</li>
							<li>
								<span class='label label-dark'>{{ $forumInfo['members'] }}</span> @lang('forums.bar.total_members')
							</li>
							<li>
								<span class='label label-dark'>
@if(!empty($forumInfo['latest']->id))
									{!! \Link::name($forumInfo['latest']->id) !!}</span> newest member
@endif
							</li>
							<li>
								<span class='label label-dark'>{{ $forumInfo['mostOnline'] }}</span> @lang('forums.bar.most_online')
							</li>
						</ul>
					</div>
					<div class='col-xs-12'>
						<div>
							<h3>
								@lang('forums.online.current', ['amount' => 1]) <small>(@lang('forums.online.in_time', ['amount' => 30]))</small>
							</h3>
						</div>
					</div>
				</div>
			</div>
@stop