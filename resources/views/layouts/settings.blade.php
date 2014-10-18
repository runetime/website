@extends('layouts.default')
@section('contents')
<?php
$settingsNav = [
	'/settings/'          => Lang::get('settings.nav.profile_settings'),
	'/settings/photo'     => Lang::get('settings.nav.photo'),
	'/settings/password'  => Lang::get('settings.nav.password'),
	'/settings/about/me'  => Lang::Get('settings.nav.about_me'),
	'/settings/signature' => Lang::get('settings.nav.signature'),
	'/settings/social'    => Lang::get('settings.nav.social'),
	'/settings/runescape' => Lang::get('settings.nav.runescape'),
];
?>
			<div class='wrapper'>
				<h1>
					@lang('settings.name')
				</h1>
				<div class='row'>
					<div class='col-xs-12 col-sm-4 col-md-2'>
						<ul class='list-group'>
@foreach($settingsNav as $settingsNavURL => $settingsNavText)
							<a href='{{$settingsNavURL}}' class='list-group-item{{$settingsNavURL == $thisURL ? ' active':''}}'>
								{{$settingsNavText}}
							</a>
@endforeach
						</ul>
					</div>
					<div class='col-xs-12 col-sm-8 col-md-10 col-lg-10'>
@yield('settings')
					</div>
				</div>
			</div>
@stop