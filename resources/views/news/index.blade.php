@extends('layouts.app')
@section('app')
		<div id='news'>
			<link href='http://fonts.googleapis.com/css?family=Playfair+Display:900,400|Lato:300,400,700' rel='stylesheet' type='text/css'>
			<link rel="stylesheet" type="text/css" href="/css/news.css" />
			<header id="header" class="news-header">
				<h1>
					RuneTime News
				</h1>
				<span class="message">
					Your mobile device does not support the slideshow feature.
				</span>
				<button class="slider-switch">
					Switch view
				</button>
			</header>
			<div id="overlay" class="overlay">
				<div class="info">
					<h2>
						News Interactions
					</h2>
					<span class="info-drag">
						Drag Sliders
					</span>
					<span class="info-keys">
						Use Arrows
					</span>
					<span class="info-switch">
						Switch view
					</span>
					<button>
						Got it!
					</button>
				</div>
			</div>
			<div id="slideshow" class="dragslider">
				<section class="img-dragger img-dragger-large dragdealer">
					<div class="handle">
@for($i = 1; $i <= 5; $i++)
						<div class="slide" data-content="content-{{ $i }}">
							<div class="img-wrap">
								<img src="/img/news/{{ $i }}.png" alt="img{{ $i }}"/>
							</div>
							<h2>
								Article {{ $i }}
								<span>
									In News Section <a href='/news/runetime'>RuneTime</a>
								</span>
							</h2>
							<button class="content-switch">
								Read more
							</button>
						</div>
@endfor
					</div>
				</section>
				<section class="pages">
@for($i = 1; $i <= 5; $i++)
					<div class="content" data-content="content-{{ $i }}">
						<h2>
							Article {{ $i }}
							<span>
								Description here
							</span>
						</h2>
						<p>
							Text
						</p>
						<p class="related">
							You might also like <a href="http://tympanus.net/Development/ArticleIntroEffects/">Inspiration for Article Intro Effects</a>
						</p>
					</div>
@endfor
				</section>
			</div>
		</div>
		<script>
			var news = new News();
		</script>
@stop