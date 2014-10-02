<?php
$navs=[
	''        =>'Home',
	'forums'  =>'Forums',
	'radio'   =>'Radio',
	'RuneTime'=>[
		'news'      =>'News',
		'awards'    =>'Awards',
		'signatures'=>'Signature Generator',
		'members'   =>'Members',
		'staff/list'     =>'Staff List',
		'about'     =>'About Us',
		'tickets'   =>'Help',
	],
	'Runescape'=>[
		'guides/quests'      =>'Quest Guides',
		'guides/locations'   =>'Location Guides',
		'databases/items/'   =>'Item Database',
		'databases/monsters/'=>'Monster Database',
		'map/runescape'      =>'World Map',
		'calculators'        =>'Calculators',
		'play'               =>'Play Runescape',
		'utility/name-check' =>'Name Checker',
		'calculators/combat' =>'Combat Calculator',
	],
	'Social'=>[
		'calendar'   =>'Event Calendar',
		'livestream' =>'Livestream',
		'media'      =>'Social Media',
		'map/members'=>'Members Map',
		'clan'       =>'Our Clan',
	],
];
if(false){
	$navs['Staff']=[
		'staff'=>'Staff Center',
		'staff/gallery','Gallery',
		'tickets/manage'=>'Ticket System',
		'staff/checkup'=>'Staff Checkup',
	];
}
if(!Auth::check())
	$navLogged=[
		'login' =>'Login',
		'signup'=>'Sign Up'
	];
else
	$navLogged=[
		Auth::user()->display_name=>[
			'forum/'.String::slugEncode(Auth::user()->id,Auth::user()->display_name)=>'My Profile',
			'forum/settings'=>'My Settings',
			'forum/messenger'=>'Messenger',
			'forum/content'=>'Content I Follow',
		],
		'logout'=>'Logout'
	];
if(!isset($nav))               $nav="Home";
if(!isset($bc))                $bc=[];
if(!isset($displayPageHeader)) $displayPageHeader=true;
if(!empty($title))             $bc['#']=$title;
$current=$nav;
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
							Toggle navigation
						</span>
						<span>
							Menu
						</span>
					</button>
					<a href='/' title='RuneTime Home' class='navbar-brand'>
						<img src='img/header.png' alt='RuneTime Header Image' class='img-responsive' />
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
						<li{{$name==$current?" class='active'":""}}>
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
				<li>
					<a href='/' title='Home'>
						Home
					</a>
				</li>
	@foreach($bc as $url=>$name)
		@if(String::startsWith('#',$url))
				<li class='active'>
					{{$name}}
				</li>
		@else
				<li>
					<a href='{{$url}}' title='{{$name}}'>
						{{$name}} 
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
					About Us
				</p>
				<div id='portfolio-about'>
					<p>
						{{-- <img src='/img/supported_bronze.png' alt='Bronze Supported Fansite' class='img-responsive pull-left' />
						<p>
							We are proud to be a Jagex Bronze Supported Fansite!
						</p> --}}
						<p>
							Copyright RuneTime &copy; {{date('Y')}} &mdash; <a href='/privacy/' title='Privacy'>privacy</a> &mdash; <a href='/terms/' title='Terms of Use'>terms of use</a>
						</p>
						<p>
							<a href='/contact/' title='Contact us'>Contact us</a>
						</p>
						<p>
							<a href='http://runescape.com/community' title='Runescape'>Runescape</a>&reg; and <a href='http://jagex.com/' title='Jagex'>Jagex</a>&reg; are trademarks of Jagex Ltd &copy; 1999-{{date('Y')}}
						</p>
						<p>
							All Runescape images are property of Jagex Ltd.
						</p>
						<p>
							RuneTime is in no way affiliated to Runescape.
						</p>
					</p>
				</div>
			</div>
			<div class='col-xs-12 col-md-6'>
				<p class='holo-text holo-line-block'>
					Follow Us
				</p>
				<div id='portfolio-social'>
					<a href='https://www.facebook.com/RuneTimeOfficial' title='Follow RuneTime on Facebook'><img src='img/fb.png' alt='Facebook' /></a>
					<a href='https://twitter.com/Rune_Time' title='Follow RuneTime on Twitter'><img src='img/tw.png' alt='Twitter' /></a>
					<a href='https://www.youtube.com/user/RuneTimeOfficial' title='Subscribe to RuneTime on YouTube'><img src='img/yt.png' alt='YouTube' /></a>
				</div>
			</div>
		</div>
		<script>
			//Google Analytics
		</script>
	</body>
</html>
