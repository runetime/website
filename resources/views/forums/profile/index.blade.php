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
						<div class='box'>
							<h3>
								@lang('profile.overview.about.name')
							</h3>
@if(!empty($profile->about_parsed))
							{!! $profile->about_parsed !!}
@else
							<em>
								@lang('profile.overview.about.empty', ['name' => $profile->display_name])
							</em>
@endif
						</div>
						<div class='box'>
							<h3>
								@lang('profile.overview.community_statistics.name')
							</h3>
							<dl class='dl-horizontal'>
								<dt>
									Reputation
								</dt>
								<dd>
									{{ $profile->reputation }}
								</dd>
								<dt>
									@lang('profile.overview.community_statistics.group')
								</dt>
								<dd>
									{!!\Link::colorRole($profile->importantRole()->id)!!}
								</dd>
								<dt>
									@lang('profile.overview.community_statistics.active_posts')
								</dt>
								<dd>
									{{$profile->posts_active}} 
								</dd>
								<dt>
									@lang('profile.overview.community_statistics.profile_views')
								</dt>
								<dd>
									{{$profile->profile_views}} 
								</dd>
@if(!empty($profile->title))
								<dt>
									@lang('profile.overview.community_statistics.title')
								</dt>
								<dd>
									{!!$profile->title!!} 
								</dd>
@endif
								<dt>
									@lang('profile.overview.community_statistics.age.name')
								</dt>
								<dd>
@if($profile->birthday > 0)
									{{$profile->birthday}} 
@else
									<em>
										@lang('profile.overview.community_statistics.age.unknown')
									</em>
@endif
								</dd>
								<dt>
									@lang('profile.overview.community_statistics.age.name')
								</dt>
								<dd>
@if($profile->birthday > 0)
									{{$profile->birthday}} 
@else
									<em>
										@lang('profile.overview.community_statistics.age.unknown')
									</em>
@endif
								</dd>
								<dt>
									@lang('profile.overview.community_statistics.gender')
								</dt>
								<dd>
									{!!\String::gender($profile->gender)!!}
								</dd>
@if(!empty($profile->referred_by))
								<dt>
									@lang('profile.overview.community_statistics.referred_by')
								</dt>
								<dd>
									{{$profile->referred_by}} 
								</dd>
@endif
							</dl>
						</div>
@if(
	   !empty($profile->social_twitter)
	|| !empty($profile->social_facebook)
	|| !empty($profile->social_youtube)
	|| !empty($profile->social_website)
	|| !empty($profile->social_skype))
						<div class='box'>
							<h3>
								@lang('profile.overview.social.name')
							</h3>
							<dl class='dl-horizontal'>
	@if(!empty($profile->social_twitter))
								<dt>
									@lang('profile.overview.social.twitter')
								</dt>
								<dd>
									<i class='fa fa-twitter-square'></i> {{ $profile->social_twitter }}
								</dd>
	@endif
	@if(!empty($profile->social_facebook))
								<dt>
									@lang('profile.overview.social.facebook')
								</dt>
								<dd>
									<i class='fa fa-facebook-square'></i> {{ $profile->social_facebook }}
								</dd>
	@endif
	@if(!empty($profile->social_youtube))
								<dt>
									@lang('profile.overview.social.youtube')
								</dt>
								<dd>
									<i class='fa fa-youtube-play'></i> {{ $profile->social_youtube }}
								</dd>
	@endif
	@if(!empty($profile->social_website))
								<dt>
									@lang('profile.overview.social.website')
								</dt>
								<dd>
									<i class='fa fa-sitemap'></i> {{ $profile->social_website }}
								</dd>
	@endif
	@if(!empty($profile->social_skype))
								<dt>
									@lang('profile.overview.social.skype')
								</dt>
								<dd>
									<i class='fa fa-skype'></i> {{ $profile->social_skype }}
								</dd>
	@endif
							</dl>
						</div>
@endif
@if(
	   !empty($profile->runescape_version)
	|| !empty($profile->runescape_allegiance)
	|| !empty($profile->runescape_clan)
	|| !empty($profile->runescape_rsn))
						<div class='box'>
							<h3>
								@lang('profile.overview.runescape.name')
							</h3>
							<dl class='dl-horizontal'>
	@if(!empty($profile->runescape_version))
								<dt>
									@lang('profile.overview.runescape.played')
								</dt>
								<dd>
									{{ $profile->runescape_version }}
								</dd>
	@endif
	@if(!empty($profile->runescape_allegiance))
								<dt>
									@lang('profile.overview.runescape.allegiance')
								</dt>
								<dd>
									{{ $profile->runescape_allegiance }}
								</dd>
	@endif
	@if(!empty($profile->runescape_clan))
								<dt>
									@lang('profile.overview.runescape.clan')
								</dt>
								<dd>
									{{ $profile->runescape_clan }}
								</dd>
	@endif
	@if(!empty($profile->runescape_rsn))
								<dt>
									@lang('profile.overview.runescape.runescape_name')
								</dt>
								<dd>
									{{ $profile->runescape_rsn }}
								</dd>
	@endif
							</dl>
						</div>
@endif
@stop