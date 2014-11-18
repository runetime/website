@extends('layouts.profile')
@section('profile')
						<div class='row row-flat'>
							<div class='col-xs-6 col-sm-5 col-md-3'>
								<h1>
									{{ $profile->display_name }}
								</h1>
								@lang('profile.overview.member_since', ['date' => \Time::DMY($profile->created_at)])
								<br />
								<span class='label label-success'>@lang('profile.status.online')</span> @lang('profile.overview.last_active')
							</div>
							<div class='col-xs-6 col-sm-7 col-md-9'>
								<div class='well well-sm'>
@if(!empty($status))
									<p class='inline'>{!! $status->posts[0]->contents_parsed !!}</p>
									<ul class='list-inline'>
										<li>
											<a href='/forums/statuses/{{ \String::slugEncode($status->id, 'by-', $status->author->display_name) }}'>
												Posted {{ \Time::monthDay($status->created_at) }}
											</a>
										</li>
										<li>
											<a href='/forums/statuses/{{ \String::slugEncode($status->id, 'by-', $status->author->display_name) }}'>
												{{ $status->reply_count }} replies
											</a>
										</li>
									</ul>
@else
									<p>
										<em>
	@if(\Auth::check() && \Auth::user()->id === $profile->id)
										You have not made a status.  <a href='/forums/statuses/create'>What's on your mind?</a>
	@else
											{{ $profile->display_name }} has not made a status.
	@endif
										</em>
									</p>
@endif
								</div>
							</div>
						</div>
						<br />
						<h3>
							Recent Threads by {{ $profile->display_name }}
						</h3>
@foreach($threads as $thread)
	@include('forums.subforum._thread', ['thread' => $thread])
@endforeach
@stop