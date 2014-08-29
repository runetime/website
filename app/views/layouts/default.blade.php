<?php
$navs=[
	''        =>'Home',
	'radio'   =>'Radio',
	'forums'  =>'Forums',
	'RuneTime'=>[
		'news'      =>'News',
		'awards'    =>'Awards',
		'signatures'=>'Signature Generator',
		'members'   =>'Members',
		'staff'     =>'Staff List',
		'about'     =>'About Us',
		'tickets'   =>'Help'
	],
	'Runescape'=>[
		'guides/quests'      =>'Quest Guides',
		'guides/locations'   =>'Location Guides',
		'databases/items/'   =>'Item Database',
		'databases/monsters/'=>'Monster Database',
		'map'                =>'World Map',
		'calculators'        =>'Calculators',
		'play'               =>'Play Runescape',
		'calculators/combat' =>'Combat Calculator'
	],
	'Social'=>[
		'calendar'   =>'Event Calendar',
		'livestream' =>'Livestream',
		'media'      =>'Social Media',
		'members-map'=>'Members Map',
		'clan'       =>'Our Clan'
	]
];
$navLogged=[
	'out'=>[
		'login' =>'Login',
		'signup'=>'Sign Up'
	],
	'in'=>[
		'Username'=>[
			'#'=>'My Profile',
			'#'=>'My Content',
			'#'=>'my Settings',
			'#'=>'Manage Friends',
			'#'=>'Personal Messenger',
			'#'=>'Content I Follow',
			'#'=>'Manage Ignore Prefs'
		],
		'logout'=>'Logout'
	]
];
$mobile=Utilities::mobile()?
	"var MOBILE=1;":
	"";
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
		{{HTML::style('css/style.css')}}
@if(!empty($css))
		{{HTML::style('css/'.$css.'.css')}}
@endif
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
					<a href='{{Utilities::URL()}}' title='RuneTime Home' class='navbar-brand'>
						{{HTML::image('img/header.png','RuneTime Header Image',['class'=>'img-responsive'])}}
					</a>
				</div>
				<div class='collapse navbar-collapse' id='bs-example-navbar-collapse-1'>
					<ul class='nav navbar-nav'>
@foreach($navs as $url=>$name)
@if(is_array($name))
						<li class='dropdown'>
							<a href='#' class='dropdown-toggle' data-toggle='dropdown'>
								{{$url}} <span class='caret'></span>
							</a>
							<ul class='dropdown-menu' role='menu'>
@foreach($name as $url2=>$name2)
								<li>
									{{HTML::link(Utilities::URL($url2),$name2)}}
								</li>
@endforeach
							</ul>
						</li>
@else
						<li{{$name==$current?" class='active'":""}}>
							{{HTML::link(Utilities::URL($url),$name)}}
						</li>
@endif
@endforeach
					</ul>
					<ul class='nav navbar-nav navbar-right'>
@if(Auth::check())
@foreach($navLogged['in'] as $url=>$name)
@if(is_array($name))
						<li class='dropdown'>
							<a href='#' class='dropdown-toggle' data-toggle='dropdown'>
								{{$url}} <span class='caret'></span>
							</a>
							<ul class='dropdown-menu' role='menu'>
@foreach($name as $url2=>$name2)
								<li>
									{{HTML::link(Utilities::URL($url2),$name2)}}
								</li>
@endforeach
							</ul>
						</li>
@else
						<li>
							{{HTML::link(Utilities::URL($url),$name)}}
						</li>
@endif
@endforeach
@else
@foreach($navLogged['out'] as $url=>$name)
						<li>
							{{HTML::link(Utilities::URL($url),$name)}}
						</li>
@endforeach
@endif
					</ul>
				</div>
			</div>
		</nav>
@if($displayPageHeader&&!empty($title))
		<div class='wrapper-none'>
			<ol class='breadcrumb'>
				<li>
					<a href='{{Utilities::URL()}}' title='Home'>
						Home
					</a>
				</li>
@foreach($bc as $url=>$name)
@if($url=="#")
				<li class='active'>
					{{$name}}
				</li>
@else
				<li>
					{{HTML::link($url,$name)}}
				</li>
@endif
@endforeach
			</ol>
		</div>
@endif
		<div id='page'>
@if(!empty($contents))
			{{$contents}}
@else
			@yield('contents')
@endif
		</div>
		<div id='portfolio' class='row wrapper-holo'>
			<div class='col-xs-12 col-md-6'>
				<p class='holo-text holo-line-block'>
					About Us
				</p>
				<div id='portfolio-about'>
					<p>
						{{HTML::image(Utilities::URL('img/supported_bronze.png'),'Bronze Supported Fansite',['class'=>'img-responsive pull-left'])}}
						<p>
							We are proud to be a Jagex Bronze Supported Fansite!
						</p>
						<p>
							Copyright RuneTime &copy; {{date('Y')}} &mdash; privacy &mdash; terms of use
						</p>
						<p>
							Contact us: Officialrunetime@gmail.com
						</p>
						<p>
							{{HTML::link('http://runescape.com/community','RuneScape')}}&reg; and {{HTML::link('http://jagex.com/','Jagex')}}&reg; are trademarks of Jagex Ltd &copy; 1999-{{date('Y')}}
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
					<a href='https://www.facebook.com/RuneTimeOfficial' title='Follow RuneTime on Facebook'>{{HTML::image('img/fb.png','Facebook')}}</a>
					<a href='https://twitter.com/Rune_Time' title='Follow RuneTime on Twitter'>{{HTML::image('img/tw.png','Twitter')}}</a>
					<a href='https://www.youtube.com/user/RuneTimeOfficial' title='Subscribe to RuneTime on YouTube'>{{HTML::image('img/yt.png','YouTube')}}</a>
				</div>
			</div>
		</div>
		<script>
			//Google Analytics
			{{$mobile}}
		</script>
		{{HTML::script('js/jquery.js')}}
		{{HTML::script('js/bootstrap.js')}}
@if(!empty($js))
		{{HTML::script('js/'.$js.'.js')}}
@endif
	</body>
</html>
