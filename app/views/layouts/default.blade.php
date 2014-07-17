<?php
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
		<link rel='apple-touch-icon' href='/css/favicon.png' />
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
					<button class='navbar-toggle' type='button' data-toggle='collapse' data-target='#navbar-ul'>
						<span class='sr-only'>
							Toggle Navigation
						</span>
						<span>
							Menu
						</span>
					</button>
					{{HTML::link('','RuneTime',['class'=>'navbar-brand'])}} 
				</div>
				<div id='navbar-ul' class='collapse navbar-collapse'>
					<ul class='nav navbar-nav navbar-left'>
						<li class='active'>
							Home
						</li>
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
	</body>
</html>