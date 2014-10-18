@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Settings
				</h1>
				<div class='row'>
					<div class='col-xs-12 col-sm-4 col-md-2'>
						<ul class='list-group'>
							<a href='/settings/' class='list-group-item'>
								@lang('settings.nav.profile_settings')
							</a>
							<a href='/settings/photo' class='list-group-item'>
								@lang('settings.nav.photo')
							</a>
							<a href='/settings/password' class='list-group-item'>
								@lang('settings.nav.password')
							</a>
							<a href='/settings/about/me' class='list-group-item'>
								@lang('settings.nav.about_me')
							</a>
							<a href='/settings/signature' class='list-group-item'>
								@lang('settings.nav.signature')
							</a>
							<a href='/settings/social' class='list-group-item'>
								@lang('settings.nav.social')
							</a>
							<a href='/settings/runescape' class='list-group-item'>
								@lang('settings.nav.runescape')
							</a>
						</ul>
					</div>
					<div class='col-xs-12 col-sm-8 col-md-10 col-lg-10'>
@yield('settings')
					</div>
				</div>
			</div>
@stop