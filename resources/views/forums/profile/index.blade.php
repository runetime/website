@extends('layouts.profile')
@section('profile')
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
            @lang('profile.overview.community_statistics.reputation')
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
            @lang('profile.overview.community_statistics.birthday.name')
        </dt>
        <dd>
@if(isset($birthday) && !empty($birthday))
            {{ $birthday }}
@else
            <em>
                @lang('profile.overview.community_statistics.birthday.unknown')
            </em>
@endif
        </dd>
        <dt>
            @lang('profile.overview.community_statistics.gender')
        </dt>
        <dd>
            {!!\String::gender($profile->gender)!!}
        </dd>
@if(!empty($profile->referredBy))
        <dt>
            @lang('profile.overview.community_statistics.referred_by')
        </dt>
        <dd>
            {!! \Link::name($profile->referredBy->display_name) !!}
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
