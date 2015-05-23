@extends('layouts.default')
@section('contents')
<?php
$settingsNav = [
    '/settings/'          => trans('settings.nav.profile_settings'),
    '/settings/photo'     => trans('settings.nav.photo'),
    '/settings/password'  => trans('settings.nav.password'),
    '/settings/about-me'  => trans('settings.nav.about_me'),
    '/settings/signature' => trans('settings.nav.signature'),
    '/settings/social'    => trans('settings.nav.social'),
    '/settings/runescape' => trans('settings.nav.runescape'),
];
?>
<div class='wrapper'>
    <h1>
        @lang('settings.title')
    </h1>
    <div class='row'>
        <div class='col-xs-12 col-sm-4 col-md-2'>
            <ul class='list-group'>
@foreach($settingsNav as $settingsNavURL => $settingsNavText)
                <a href='{{ $settingsNavURL }}' class='list-group-item{{ $settingsNavURL === $thisURL ? ' active':'' }}'>
                    {{ $settingsNavText }}
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
