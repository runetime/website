<?php
$messages=3;
$follow=6;
$notifications=$messages + $follow;
$navs=[
	''       => Lang::get('navbar.home'),
	'forums' => Lang::get('navbar.forums'),
	'radio'  => Lang::get('navbar.radio'),
	Lang::get('navbar.runetime.runetime') => [
		'news'       => Lang::get('navbar.runetime.news'),
		'awards'     => Lang::get('navbar.runetime.awards'),
		'signatures' => Lang::get('navbar.runetime.signatures'),
		'members'    => Lang::get('navbar.runetime.members'),
		'staff/list' => Lang::get('navbar.runetime.staff_list'),
		'about'      => Lang::get('navbar.runetime.about_us'),
		'tickets'    => Lang::get('navbar.runetime.help'),
	],
	Lang::get('navbar.runescape.runescape') => [
		'guides/quests'       => Lang::get('navbar.runescape.guides.quests'),
		'guides/locations'    => Lang::get('navbar.runescape.guides.locations'),
		'databases/items/'    => Lang::get('navbar.runescape.databases.items'),
		'databases/monsters/' => Lang::get('navbar.runescape.databases.monsters'),
		'map/runescape'       => Lang::get('navbar.runescape.world_map'),
		'calculators'         => Lang::get('navbar.runescape.calculators'),
		'play'                => Lang::get('navbar.runescape.play'),
		'name/check'  => Lang::get('navbar.runescape.name_checker'),
		'calculators/combat'  => Lang::get('navbar.runescape.combat_calculator'),
	],
	Lang::get('navbar.social.social') => [
		'calendar'    => Lang::get('navbar.social.calendar'),
		'livestream'  => Lang::get('navbar.social.livestream'),
		'media'       => Lang::get('navbar.social.social_media'),
		'map/members' => Lang::get('navbar.social.members_map'),
		'clan'        => Lang::get('navbar.social.our_clan'),
	],
];
if(\Auth::check() && \Auth::user()->isStaff()) {
	$navs['Staff'] = [
		'staff'          => Lang::get('navbar.staff.staff'),
	];
	if(\Auth::user()->hasOneOfRoles(1))
		$navs['Staff']['staff/administrator'] = Lang::get('navbar.staff.administrator');
	if(\Auth::user()->hasOneOfRoles(1, 2, 3))
		$navs['Staff']['staff/radio'] = Lang::get('navbar.staff.radio');
	if(\Auth::user()->hasOneOfRoles(1, 10, 11))
		$navs['Staff']['staff/moderation'] = Lang::get('navbar.staff.moderation');
	$navs['Staff']['tickets/manage'] = Lang::get('navbar.staff.ticket');
	$navs['Staff']['staff/checkup']  = Lang::get('navbar.staff.checkup');
}
if(!Auth::check())
	$navLogged = [
		'login'  => Lang::get('navbar.logged.out.login'),
		'signup' => Lang::get('navbar.logged.out.signup'),
	];
else
	$navLogged = [
		Auth::user()->display_name => [
			'profile/'.String::slugEncode(Auth::user()->id, Auth::user()->display_name) => Lang::get('navbar.logged.in.my_profile'),
			'settings'  => Lang::get('navbar.logged.in.my_settings'),
			'messenger' => Lang::get('navbar.logged.in.messenger').'<span class=\'badge badge-important pull-right\'>'.$messages.'</span>',
			'forums/content'   => Lang::get('navbar.logged.in.content').'<span class=\'badge badge-info pull-right\'>'.$follow.'</span>',
		],
		'logout' => Lang::get('navbar.logged.in.logout'),
	];
if(!isset($nav))               $nav = "Home";
if(!isset($bc))                $bc = [];
if(!isset($displayPageHeader)) $displayPageHeader = true;
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
		<link rel="shortcut icon" href='/img/favicon.ico' />
		<link rel='apple-touch-icon' href='/img/favicon.ico' />
		<link rel='canonical' href='http://runetime.com/' />
		<link rel='home' href='/' />
		<link rel='index' href='/sitemap/' />
		<link rel='stylesheet' href='css/style.css' />
@if(!empty($css))
		<link rel='stylesheet' href='css/{{$css}}.css'>
@endif
		<script src='js/jquery.js'></script>
		<script src='js/jquery-ui.js'></script>
		<script src='js/bootstrap.js'></script>
@if(!empty($js))
		<script src='js/{{$js}}.js'></script>
@endif
		<script src='js/main.js'></script>
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
		@foreach($name as $url2=>$name2)
								<li>
									<a href='{{$url2}}' title='{{$name2}}'>
										{{$name2}} 
									</a>
								</li>
		@endforeach
							</ul>
						</li>
	@else
						<li{{$name==$current?" class=active":""}}>
							<a href='{{$url}}' title='{{$name}}'>
								{{$name}} 
							</a>
						</li>
	@endif
@endforeach
					</ul>
					<ul class='nav navbar-nav navbar-right'>
@foreach($navLogged as $url=>$name)
	@if(is_array($name))
						<li class='dropdown{{$url==$current?" active":""}}'>
							<a href='#' class='dropdown-toggle' data-toggle='dropdown'>
								{{$url}} {!!$notifications>0?"<span class='badge badge-important'>".$notifications."</span>":""!!}<span class='caret'></span>
							</a>
							<ul class='dropdown-menu' role='menu'>
		@foreach($name as $url2 => $name2)
								<li>
									<a href='{{$url2}}'>
										{!!$name2!!} 
									</a>
								</li>
		@endforeach
							</ul>
						</li>
	@else
						<li{{$name == $current?" class=active":""}}>
							<a href='{{$url}}' title='{{$name}}'>
								{{$name}} 
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
		<div id='portfolio' class='row wrapper-holo'>
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
					<a href='https://www.facebook.com/RuneTimeOfficial' title='@lang('footer.facebook')'><img src='img/fb.png' alt='Facebook' /></a>
					<a href='https://twitter.com/Rune_Time' title='@lang('footer.twitter')'><img src='img/tw.png' alt='Twitter' /></a>
					<a href='https://www.youtube.com/user/RuneTimeOfficial' title='@lang('footer.youtube')'><img src='img/yt.png' alt='YouTube' /></a>
				</div>
			</div>
			<p class='pull-right'>
				<a href='/language/set' data-toggle='tooltip' data-placement='top' title='@lang('footer.language')'>
					<i class='text-info fa fa-language'></i>
				</a>
			</p>
		</div>
		<div id='top'>
			<a data-toggle='tooltip' data-placement='top' title='Back to Top'>
				<i class='fa fa-chevron-up'></i>
			</a>
		</div>
	</body>
</html>
