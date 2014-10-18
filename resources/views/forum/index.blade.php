@extends('layouts.default')
@section('contents')
			<div class='wrapper wrapper-flat'>
				<br />
				<div class='row row-flat'>
					<div class='col-xs-12 col-md-9'>
@foreach($subforumList[-1] as $subforums)
	@if(empty(json_decode($subforums->roles)) || Auth::check() && in_array(\Auth::user()->importantRole()->id,json_decode($subforums->roles)))
						<h3 class='panel-title'>
							<a href='/forums/{{\String::slugEncode($subforums->id,$subforums->name)}}' title='{{$subforums->name}}'>
								{{$subforums->name}}
							</a>
						</h3>
		@foreach($subforumList[$subforums->id] as $subforum)
			@if(empty(json_decode($subforum->roles)) || \Auth::check() && in_array(\Auth::user()->importantRole()->id,json_decode($subforum->roles)))
						<div class='card card-read row'>
							<div class='col-xs-12 col-sm-6 col-md-7'>
								<h4>
									<a href='/forums/{{\String::slugEncode($subforum->id,$subforum->name)}}' title='{{$subforum->name}}'>
										{{$subforum->name}}
									</a>
								</h4>
								{{$subforum->description}}
							</div>
							<div class='col-xs-12 col-sm-6 col-md-2'>
								{{$subforum->threads}} threads
								<br />
								{{$subforum->posts}} posts
							</div>
							<div class='col-xs-12 col-sm-12 col-md-3'>
				@if(!empty($subforum->last_post_info))
								<a href='/forums/thread/{{\String::slugEncode($subforum->last_thread_info->id, $subforum->last_thread_info->title)}}' title='{{$subforum->last_thread_title}}'>
									{{$subforum->last_thread_info->title}}
								</a>
								<br />
								by {!!\Link::name($subforum->last_post_info->author_id)!!}
								<br />
								<a href='/forums/thread/{{\String::slugEncode($subforum->last_thread_info->id, $subforum->last_thread_info->title)}}/last-post' title='{{$subforum->last_thread_title}}'>
									{!!\Time::shortReadable($subforum->last_post_info->created_at)!!}
								</a>
				@endif

							</div>
						</div>
			@endif
		@endforeach
	@endif
@endforeach
					</div>
					<div class='col-xs-12 col-md-3'>
						<h3>
							Recent Threads
						</h3>
						<div class='holo-box-dark'>
@foreach($recentThreads as $thread)
							<div class='holo-box-in'>
								{!!\Image::userPhoto($thread->author_id,['photo-sm','pull-left'])!!} 
								<a href='/forums/thread/{{\String::slugEncode($thread->id, $thread->title)}}' title='{{$thread->title}}'>
									{{$thread->title}} 
								</a>
								<br />
								{!!\Link::name($thread->author_id)!!}, <span class='text-muted'>{{\Time::shortReadable($thread->created_at)}}</span>
							</div>
@endforeach
						</div>
						<h3>
							Recent Posts
						</h3>
					</div>
					<div class='col-xs-12 text-center'>
						<ul class='list-inline'>
							<li>
								<span class='label label-default'>{{$forumInfo->posts}}</span> total posts
							</li>
							<li>
								<span class='label label-default'>{{$forumInfo->members}}</span> total members
							</li>
							<li>
								<span class='label label-default'>{!!\Link::name($forumInfo->latest->id)!!}</span>
							</li>
                            <li>
                                <span class='label label-default'>{{$forumInfo->mostOnline}}</span> most online
                            </li>
						</ul>
                    </div>
					<div class='col-xs-12'>
						<div class='pull-right'>
							<ul class='list-inline'>
								<li>
									<a href='/forums/posters/today' title="Today's top posters">
										Today's top posters
									</a>
								</li>
								<li>
									<a href='/forums/posters/overall' title='Overall Top Posters'>
										Overall Top Posters
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h3>
								{{1}} users are online <small>(in the past 15 minutes)</small>
							</h3>
						</div>
					</div>
				</div>
			</div>
@stop