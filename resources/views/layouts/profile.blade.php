@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<div class='row'>
					<div class='col-xs-12 col-sm-3 col-md-2'>
						{!!\Image::userPhoto($profile->id)!!}
						<ul class='list-group'>
							<a href='/profile/{{\String::slugEncode($profile->id, $profile->display_name)}}' class='list-group-item'>
								@lang('profile.nav.overview')
							</a>
							<a href='/profile/{{\String::slugEncode($profile->id, $profile->display_name)}}/feed' class='list-group-item'>
								@lang('profile.nav.profile_feed')
							</a>
							<a href='/profile/{{\String::slugEncode($profile->id, $profile->display_name)}}/friends' class='list-group-item'>
								@lang('profile.nav.friends')
							</a>
						</ul>
					</div>
					<div class='col-xs-12 col-sm-9 col-md-10'>
@yield('profile')
					</div>
				</div>
			</div>
@stop