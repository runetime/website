<?php
use App\RuneTime\Notifications\NotificationRepository;
use App\RuneTime\Notifications\Notification;

$messages = 0;
$notifications = 0;
if(\Auth::check()) {
	$notificationRepository = new NotificationRepository(new Notification);
	$messages = $notificationRepository->getCountByUser(\Auth::user()->id, 'Messenger');
	$notifications = $notificationRepository->getCountByUser(\Auth::user()->id);
}
$navs = [
	''       => trans('navbar.home'),
	'forums' => trans('navbar.forums'),
	'radio'  => trans('navbar.radio'),
	trans('navbar.runetime.runetime') => [
		'news'       => trans('navbar.runetime.news'),
		'awards'     => trans('navbar.runetime.awards'),
		'signatures' => trans('navbar.runetime.signatures'),
		'members'    => trans('navbar.runetime.members'),
		'staff/list' => trans('navbar.runetime.staff_list'),
		'about'      => trans('navbar.runetime.about_us'),
		'tickets'    => trans('navbar.runetime.tickets'),
	],
	trans('navbar.runescape.runescape') => [
		'guides/quests'       => trans('navbar.runescape.guides.quests'),
		'guides/locations'    => trans('navbar.runescape.guides.locations'),
		'databases/items/'    => trans('navbar.runescape.databases.items'),
		'databases/monsters/' => trans('navbar.runescape.databases.monsters'),
		'map/runescape'       => trans('navbar.runescape.world_map'),
		'calculators'         => trans('navbar.runescape.calculators'),
		'play'                => trans('navbar.runescape.play'),
		'name/check'  => trans('navbar.runescape.name_checker'),
		'calculators/combat'  => trans('navbar.runescape.combat_calculator'),
	],
	trans('navbar.social.social') => [
		'livestream'  => trans('navbar.social.livestream'),
		'media'       => trans('navbar.social.social_media'),
		'clan'        => trans('navbar.social.our_clan'),
	],
];
if(\Auth::check() && \Auth::user()->isStaff()) {
	$navs[trans('navbar.staff.staff')] = [
		'staff'          => trans('navbar.staff.staff_panel'),
	];
	if(\Auth::user()->hasOneOfRoles(1))
		$navs[trans('navbar.staff.staff')]['staff/administrator'] = "<span class='members-administrator-no-img'>" . Lang::get('navbar.staff.administrator') . "</span>";
	if(\Auth::user()->hasOneOfRoles(1, 2, 3))
		$navs[trans('navbar.staff.staff')]['staff/radio'] = "<span class='members-radio-dj-no-img'>" . Lang::get('navbar.staff.radio') . "</span>";
	if(\Auth::user()->isLeader() && !\Auth::user()->isAdmin())
		$navs[trans('navbar.staff.staff')]['staff/leader'] = \Link::color(trans('navbar.staff.team_leader'), \Auth::user()->importantRole()->id, false);
	$navs[trans('navbar.staff.staff')]['tickets/manage'] = Lang::get('navbar.staff.ticket');
	$navs[trans('navbar.staff.staff')]['staff/checkup']  = Lang::get('navbar.staff.checkup');
}
if(!Auth::check())
	$navLogged = [
		'login'  => Lang::get('navbar.logged.out.login'),
		'signup' => Lang::get('navbar.logged.out.signup'),
	];
else
	$navLogged = [
		\Link::name(Auth::user()->id) => [
			'profile/'.String::slugEncode(Auth::user()->id, Auth::user()->display_name) => Lang::get('navbar.logged.in.my_profile'),
			'settings'  => Lang::get('navbar.logged.in.my_settings'),
			'messenger' => Lang::get('navbar.logged.in.messenger').'<span class=\'badge badge-important pull-right\'>'.$messages.'</span>',
			'notifications'   => Lang::get('navbar.logged.in.notifications').'<span class=\'badge badge-info pull-right\'>'.$notifications.'</span>',
		],
		'logout' => Lang::get('navbar.logged.in.logout'),
	];
if(!isset($nav))               $nav = "Home";
if(!isset($bc))                $bc = [];
if(!isset($displayPageHeader)) $displayPageHeader = true;
if(!isset($js))                $js = [];
if(!empty($title))             $bc['#'] = $title;
$current = $nav;
?>
<!DOCTYPE html>
<html class='no-js'>
	<head>
		<base href='/' />
		<title>
			{{!empty($title)?$title." | ":""}}RuneTime
		</title>
		<meta charset='UTF-8' />
		<meta http-equiv='Content-Type' content='text/html;charset=iso-8859-1' />
		<meta name='author' content='RuneTime' />
		<meta name='description' content='RuneTime' />
		<meta name='Generator' content='RuneTime' />
		<meta name='keywords' content='' />
		<meta name='robots' content='index,follow' />
		<meta name='viewport' content='width=device-width, initial-scale=1.0' />
		<meta name='_token' content='{!! csrf_token() !!}'>
		<link rel="shortcut icon" href='/img/favicon.ico' />
		<link rel='apple-touch-icon' href='/img/favicon.ico' />
		<link rel='canonical' href='http://runetime.com/' />
		<link rel='home' href='/' />
		<link rel='index' href='/sitemap/' />
		<link rel='stylesheet' href='/css/style.css' />
		<script src='/js/vendor.js'></script>
@foreach($js as $jsFile)
		<script src='/js/{{ $jsFile }}.js'></script>
@endforeach
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
@foreach($navs as $url=>$name)
	@if(is_array($name))
						<li class='dropdown{{$url==$current?" active":""}}'>
							<a href='#' class='dropdown-toggle' data-toggle='dropdown'>
								{{$url}} <span class='caret'></span>
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
						<li{{ $name == $current ? " class=active" : "" }}>
							<a href='{{ $url }}' title='{{$name}}'>
								{!! $name !!}
							</a>
						</li>
	@endif
@endforeach
					</ul>
					<ul class='nav navbar-nav navbar-right'>
@foreach($navLogged as $url => $name)
	@if(is_array($name))
						<li class='dropdown{{ $url == $current ? " active" : "" }}'>
							<a href='#' class='dropdown-toggle members-{{ \Auth::user()->importantRole()->class_name }}' data-toggle='dropdown'>
								{{ \Auth::user()->display_name }} {!! $notifications > 0 ? "<span class='badge badge-important'>" . $notifications . "</span>" : "" !!}<span class='caret'></span>
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
						<li{{$name == $current?" class=active":""}}>
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
@if($displayPageHeader&&!empty($title))
		<div class='wrapper-none'>
			<ol class='breadcrumb'>
				<li data-toggle='tooltip' data-placement='bottom' title='Home'>
					<a href='/' title='Home'>
						@lang('navbar.home')
					</a>
				</li>
	@foreach($bc as $url => $name)
		@if(String::startsWith('#', $url))
				<li class='active' data-toggle='tooltip' data-placement='bottom' title='{{ $name }}'>
					<span>
						{{ $name }}
					</span>
				</li>
		@else
				<li>
					<a href='{{ $url }}' data-toggle='tooltip' data-placement='bottom' title='{{ $name }}'>
						{{ $name }}
					</a>
				</li>
		@endif
	@endforeach
			</ol>
		</div>
@endif
		<div id='page'>
@yield('contents')
		</div>
		<div id='portfolio' class='row wrapper-dark'>
			<div class='col-xs-12 col-md-6'>
				<p class='holo-text holo-line-block'>
					@lang('footer.about_us')
				</p>
				<div id='portfolio-about'>
					<p>
						@lang('footer.copyright') &copy; {{date('Y')}} &mdash; <a href='/privacy' title='@lang('footer.privacy')'>@lang('footer.privacy')</a> &mdash; <a href='/terms' title='@lang('footer.terms')'>@lang('footer.terms')</a>
					</p>
					<p>
						<a href='/contact' title='@lang('footer.contact')'>@lang('footer.contact')</a>
					</p>
					<p>
						<a href='http://runescape.com/community' title='Runescape'>Runescape</a>&reg; @lang('footer.and') <a href='http://jagex.com/' title='Jagex'>Jagex</a>&reg; @lang('footer.trademarks') Jagex Ltd &copy; 1999-{{date('Y')}}
					</p>
					<p>
						@lang('footer.images')
					</p>
					<p>
						@lang('footer.affiliated')
					</p>
				</div>
			</div>
			<div class='col-xs-12 col-md-6'>
				<p class='holo-text holo-line-block'>
					@lang('footer.follow_us')
				</p>
				<div id='portfolio-social'>
					<a href='https://www.facebook.com/RuneTimeOfficial' title='@lang('footer.facebook')'><img src='/img/fb.png' alt='Facebook' /></a>
					<a href='https://twitter.com/Rune_Time' title='@lang('footer.twitter')'><img src='/img/tw.png' alt='Twitter' /></a>
					<a href='https://www.youtube.com/user/RuneTimeOfficial' title='@lang('footer.youtube')'><img src='/img/yt.png' alt='YouTube' /></a>
				</div>
			</div>
			<p class='pull-right'>
				<a href='/language/set' data-toggle='tooltip' data-placement='top' title='@lang('footer.language')'>
					<i class='text-info fa fa-language'></i>
				</a>
			</p>
		</div>
		<div id='top' class='hidden-xs'>
			<a data-toggle='tooltip' data-placement='top' title='Back to Top'>
				<i class='fa fa-chevron-up'></i>
			</a>
		</div>
		<div id='loading'></div>
		<script>$(function(){$('form').append("<input type='hidden' name='_token' value='{!! csrf_token() !!}' />")});</script>
	</body>
</html>
