@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<div class='row'>
					<div class='col-xs-12 col-sm-3 col-md-2'>
						{!!\Image::userPhoto($profile->id)!!} 
						<ul class='list-group'>
							<li class='list-group-item'>
								Overview
							</li>
							<li class='list-group-item'>
								Profile Feed
							</li>
							<li class='list-group-item'>
								Friends
							</li>
						</ul>
					</div>
					<div class='col-xs-12 col-sm-9 col-md-10'>
						<div class='row row-flat'>
							<div class='col-xs-6 col-sm-5 col-md-3'>
								<h1>
									{{$profile->display_name}} 
								</h1>
								Member since {{\Time::DMY($profile->created_at)}} 
								<br />
								<span class='label label-success'>online</span> Last Active
							</div>
							<div class='col-xs-6 col-sm-7 col-md-9'>
								Status
							</div>
						</div>
						<br />
						<div class='box'>
							<h3>
								About Me
							</h3>
@if(!empty($profile->about_parsed))
							{{$profile->about_parsed}} 
@else
							<em>
								{{$profile->display_name}} has not written about themselves yet.
							</em>
@endif
						</div>
						<div class='box'>
							<h3>
								Community Statistics
							</h3>
							<dl class='dl-horizontal'>
								<dt>
									Group
								</dt>
								<dd>
									{!!\Link::colorRole($profile->importantRole()->id)!!} 
								</dd>
								<dt>
									Active Posts
								</dt>
								<dd>
									{{$profile->posts_active}} 
								</dd>
								<dt>
									Profile Views
								</dt>
								<dd>
									{{$profile->profile_views}} 
								</dd>
@if(!empty($profile->title))
								<dt>
									Title
								</dt>
								<dd>
									{!!$profile->title!!} 
								</dd>
@endif
								<dt>
									Age
								</dt>
								<dd>
@if($profile->birthday > 0)
									{{$profile->birthday}} 
@else
									<em>
										Age Unknown
									</em>
@endif
								</dd>
								<dt>
									Birthday
								</dt>
								<dd>
@if($profile->birthday > 0)
									{{$profile->birthday}} 
@else
									<em>
										Birthday Unknown
									</em>
@endif
								</dd>
								<dt>
									Gender
								</dt>
								<dd>
									{!!\String::gender($profile->gender)!!}
								</dd>
@if(!empty($profile->referred_by))
								<dt>
									Referred By
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
								Social Information
							</h3>
							<dl class='dl-horizontal'>
	@if(!empty($profile->social_twitter))
								<dt>
									Twitter
								</dt>
								<dd>
									<i class='fa fa-twitter'></i> {{$profile->social_twitter}} 
								</dd>
	@endif
	@if(!empty($profile->social_facebook))
								<dt>
									FaceBook
								</dt>
								<dd>
									{{$profile->social_facebook}} 
								</dd>
	@endif
	@if(!empty($profile->social_youtube))
								<dt>
									YouTube
								</dt>
								<dd>
									{{$profile->social_youtube}} 
								</dd>
	@endif
	@if(!empty($profile->social_website))
								<dt>
									Website
								</dt>
								<dd>
									{{$profile->social_website}} 
								</dd>
	@endif
	@if(!empty($profile->social_skype))
								<dt>
									Skype
								</dt>
								<dd>
									<i class='fa fa-skype'></i> {{$profile->social_skype}} 
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
								RuneScape Information
							</h3>
							<dl class='dl-horizontal'>
	@if(!empty($profile->runescape_version))
								<dt>
									RuneScape Played
								</dt>
								<dd>
									{{$profile->runescape_version}} 
								</dd>
	@endif
	@if(!empty($profile->runescape_allegiance))
								<dt>
									Allegiance
								</dt>
								<dd>
									{{$profile->runescape_allegiance}} 
								</dd>
	@endif
	@if(!empty($profile->runescape_clan))
								<dt>
									Clan
								</dt>
								<dd>
									{{$profile->runescape_clan}} 
								</dd>
	@endif
	@if(!empty($profile->runescape_rsn))
								<dt>
									RuneScape Name
								</dt>
								<dd>
									{{$profile->runescape_rsn}} 
								</dd>
	@endif
							</dl>
						</div>
@endif
					</div>
				</div>
			</div>
@stop