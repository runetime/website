@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<div class='row'>
					<div class='col-xs-12 col-sm-3 col-md-2'>
						{!! \Image::userPhoto($profile->id, ['center-block']) !!}
						<ul class='list-group'>
							<a href='/profile/{{ \String::slugEncode($profile->id, $profile->display_name) }}' class='list-group-item'>
								@lang('profile.nav.overview')
							</a>
							<a href='/profile/{{ \String::slugEncode($profile->id, $profile->display_name) }}/feed' class='list-group-item'>
								@lang('profile.nav.profile_feed')
							</a>
							<a href='/profile/{{\String::slugEncode($profile->id, $profile->display_name) }}/awards' class='list-group-item'>
								@lang('profile.nav.awards')
							</a>
						</ul>
					</div>
					<div class='col-xs-12 col-sm-9 col-md-10'>
						<div class='row row-flat'>
							<div class='col-xs-6 col-sm-5 col-md-3'>
								<h1>
									{{ $profile->display_name }}
								</h1>
								@lang('profile.overview.member_since', ['date' => \Time::DMY($profile->created_at)])
								<br />
@if($profile->status() == "online")
								<span class='label label-success'>@lang('profile.status.online')</span>
@elseif($profile->status() == "away")
								<span class='label label-away'>@lang('profile.status.away')</span>
@else
								<span class='label label-danger'>@lang('profile.status.offline')</span>
@endif
								@lang('profile.overview.last_active', ['date' => \Time::shortReadable($profile->last_active)])
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
@yield('profile')
					</div>
				</div>
			</div>
@stop