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
		'guides/quests'=>'Quest Guides',
		'guides/locations'=>'Location Guides',
		'databases/items/'=>'Item Database',
		'databases/monsters/'=>'Monster Database',
		'map'=>'World Map',
		'calculators'=>'Calculators',
		'play'=>'Play Runescape'
	],
	'Social'=>[
		'calendar'=>'Event Calendar',
		'livestream'=>'Livestream',
		'media'=>'Social Media',
		'members-map'=>'Members Map',
		'clan'=>'Our Clan'
	]
];
$navLogged=[
	'out'=>[
		'login'=>'Login',
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
if(!isset($bc))                $bc=[];
if(!isset($displayPageHeader)) $displayPageHeader=true;
if(!empty($title))             $bc['#']=$title;
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
		{{HTML::style('css/bootstrap.css')}}
		{{HTML::style('css/bootstrap-theme.css')}}
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
					{{HTML::link(Utilities::URL(),'RuneTime',['class'=>'navbar-brand'])}} 
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
						<li>
							{{HTML::link(Utilities::URL($url),$name)}} 
						</li>
	@endif
@endforeach
					</ul>
					<ul class='nav navbar-nav navbar-right'>
@if(User::$logged)
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
		<div id='page'>
			<div class='wrapper'>
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
@if($displayPageHeader&&!empty($title))
				<div class='page-header'>
					<h1>
						{{$title}} @if(isset($titleSub))<small>{{$titleSub}}</small> @endif 
					</h1>
				</div>
@endif
			</div>
@yield('content') 
		</div>
		<div id='portfolio' class='wrapper-brown'>
			<div class='title'>
				<h2>
					RuneTime
				</h2>
				<span class='byline'>
					Motto here.
				</span>
			</div>
			<p>
				Links here.
			</p>
		</div>
		<div id='copyright'>
			<p>
				&copy;{{date('Y')}} RuneTime
			</p>
		</div>
		<script>
			//Google Analytics
			{{$mobile}} 
		</script>
		{{HTML::script('js/jquery.js')}}
		{{HTML::script('js/bootstrap.js')}}
	</body>
</html>