<?php
$messageCount = 0;
$notificationCount = 0;
if(\Auth::check()) {
    $notifications = \App::make('App\RuneTime\Notifications\NotificationRepository');
    $messageCount = $notifications->getCountByUser(\Auth::user()->id, 'Messenger');
    $notificationCount = $notifications->getCountByUser(\Auth::user()->id);
}

$navs = [
    ''       => trans('navbar.home'),
    'forums' => trans('navbar.forums'),
    'radio'  => trans('navbar.radio'),
    trans('navbar.runetime.title') => [
        'news'       => trans('navbar.runetime.news'),
        'awards'     => trans('navbar.runetime.awards'),
        'signatures' => trans('navbar.runetime.signatures'),
        'members'    => trans('navbar.runetime.members'),
        'staff/list' => trans('navbar.runetime.staff_list'),
        'about'      => trans('navbar.runetime.about_us'),
        'tickets'    => trans('navbar.runetime.tickets'),
    ],
    trans('navbar.runescape.title') => [
        'guides/quests'       => trans('navbar.runescape.guides.quests'),
        'guides/locations'    => trans('navbar.runescape.guides.locations'),
        'databases/items/'    => trans('navbar.runescape.databases.items'),
        'databases/monsters/' => trans('navbar.runescape.databases.monsters'),
        'calculators'         => trans('navbar.runescape.calculators'),
        'play'                => trans('navbar.runescape.play'),
        'name-check'          => trans('navbar.runescape.name_checker'),
        'calculators/combat'  => trans('navbar.runescape.combat_calculator'),
    ],
    trans('navbar.social.title') => [
        'livestream'  => trans('navbar.social.livestream'),
        'media'       => trans('navbar.social.social_media'),
        'clan'        => trans('navbar.social.our_clan'),
    ],
];

if(\Auth::check() && \Auth::user()->isStaff()) {
    $navs[trans('navbar.staff.title')] = [
        'staff'       => trans('navbar.staff.staff_panel'),
        'news/create' => trans('news.create_newspiece'),
    ];
    if(\Auth::user()->hasOneOfRoles(1)) {
        $navs[trans('navbar.staff.title')]['staff/administrator'] = "<span class='members-administrator-no-img'>" . trans('navbar.staff.administrator') . "</span>";
    }

    if(\Auth::user()->hasOneOfRoles(1, 2, 3)) {
        $navs[trans('navbar.staff.title')]['staff/radio'] = "<span class='members-radio-dj-no-img'>" . trans('navbar.staff.radio') . "</span>";
    }

    if(\Auth::user()->isLeader() && !\Auth::user()->isAdmin()) {
        $navs[trans('navbar.staff.title')]['staff/leader'] = \Link::color(trans('navbar.staff.team_leader'), \Auth::user()->importantRole()->id, false);
    }

    $navs[trans('navbar.staff.title')]['tickets/manage'] = trans('navbar.staff.ticket');
    $navs[trans('navbar.staff.title')]['staff/checkup'] = trans('navbar.staff.checkup');
}

if(!Auth::check()) {
    $navLogged = [
        'login'  => trans('navbar.logged.out.login'),
        'signup' => trans('navbar.logged.out.signup'),
    ];
} else {
    $navLogged = [
        \Link::name(Auth::user()->id) => [
            'profile/'.String::slugEncode(Auth::user()->id, Auth::user()->display_name) => trans('navbar.logged.in.my_profile'),
            'settings'  => trans('navbar.logged.in.my_settings'),
            '/forums/statuses/create' => trans('forums.statuses.update'),
            'messenger' => trans('navbar.logged.in.messenger').'<span class=\'badge badge-important pull-right\'>'.$messageCount.'</span>',
            'notifications'   => trans('navbar.logged.in.notifications').'<span class=\'badge badge-info pull-right\'>'.$notificationCount.'</span>',
        ],
        'logout' => trans('navbar.logged.in.logout'),
    ];
}

if(!isset($nav))               $nav = "Home";
if(!isset($js))                $js = [];
if(!empty($title))             $bc['#'] = $title;
$current = $nav;
?>
<!DOCTYPE html>
<html class='no-js'>
    <head>
        <base href='/' />
        <title>
            {{ !empty($title) ? $title . " | " : "" }}RuneTime
        </title>
        <meta charset='UTF-8' />
        <meta http-equiv='Content-Type' content='text/html;charset=iso-8859-1' />
        <meta name='author' content='RuneTime' />
        <meta name='description' content='RuneTime' />
        <meta name='Generator' content='RuneTime' />
        <meta name='keywords' content='' />
        <meta name='robots' content='index,follow' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <meta name='_token' content='{{ base64_encode(csrf_token()) }}' />
        <link rel="shortcut icon" href='/img/favicon.ico' />
        <link rel='apple-touch-icon' href='/img/favicon.ico' />
        <link rel='canonical' href='http://runetime.com/' />
        <link rel='home' href='/' />
        <link rel='index' href='/sitemap/' />
        <link rel='stylesheet' href='/css/style.css' />
        <script src='/js/vendor.js'></script>
        <script src='/js/modules.js'></script>
@if(\Auth::check() && \Auth::user()->isStaff())
        <script src='/js/admin.js'></script>
@endif
    </head>
    <body>
        <nav class='navbar navbar-default navbar-fixed-top navbar-inverse' role='navigation'>
            <div class='container-fluid'>
                <div class='navbar-header'>
                    <button type='button' class='navbar-toggle' data-toggle='collapse' data-target='#bs-example-navbar-collapse-1'>
                        <span class='sr-only'>
                            @lang('navbar.toggle_navigation')
                        </span>
                        <span>
                            @lang('navbar.menu')
                        </span>
                    </button>
                    <a href='/' title='RuneTime Home' class='navbar-brand'>
                        <img src='/img/header.png' alt='RuneTime Header Image' class='img-responsive' />
                    </a>
                </div>
                <div class='collapse navbar-collapse' id='bs-example-navbar-collapse-1'>
                    <ul class='nav navbar-nav'>
@foreach($navs as $url => $name)
    @if(is_array($name))
        @if($url === $current)
                        <li class='dropdown active'>
        @else
                        <li class='dropdown'>
        @endif
                            <a href='#' class='dropdown-toggle' data-toggle='dropdown'>
                                {{ $url }} <span class='caret'></span>
                            </a>
                            <ul class='dropdown-menu' role='menu'>
        @foreach($name as $url2 => $name2)
                                <li>
                                    <a href='{{ $url2 }}' title='{{ $name2 }}'>
                                        {!! $name2 !!}
                                    </a>
                                </li>
        @endforeach
                            </ul>
                        </li>
    @else
        @if($name === $current)
                        <li class='active'>
        @else
                        <li>
        @endif
                            <a href='{{ $url }}' title='{{ $name }}'>
                                {!! $name !!}
                            </a>
                        </li>
    @endif
@endforeach
                    </ul>
                    <ul class='nav navbar-nav navbar-right'>
                        <li id='search-glass'>
                            <a class='fa fa-search'>
                            </a>
                        </li>
@foreach($navLogged as $url => $name)
    @if(is_array($name))
        @if($url === $current)
                        <li class='dropdown active'>
        @else
                        <li class='dropdown'>
        @endif
                            <a href='#' class='dropdown-toggle members-{{ \Auth::user()->importantRole()->class_name }}' data-toggle='dropdown'>
                                {{ \Auth::user()->display_name }}
        @if($notificationCount > 0)
                                <span class='badge badge-important'>
                                    {{ $notificationCount }}
                                </span>
        @endif
                                <span class='caret'></span>
                            </a>
                            <ul class='dropdown-menu' role='menu'>
        @foreach($name as $url2 => $name2)
                                <li>
                                    <a href='{{ $url2 }}'>
                                        {!! $name2 !!}
                                    </a>
                                </li>
        @endforeach
                            </ul>
                        </li>
    @else
        @if($name === $current)
            <li class='active'>
        @else
            <li>
        @endif
                            <a href='{{ $url }}' title='{{ $name }}'>
                                {!! $name !!}
                            </a>
                        </li>
    @endif
@endforeach
                    </ul>
                </div>
            </div>
        </nav>
@yield('app')
@include('partials/_search')
        <script>$(function(){utilities.formToken('{{ base64_encode(csrf_token()) }}');});</script>
    </body>
</html>
