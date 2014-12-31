@extends('layouts.app')
@section('app')
		<div id='news'>
			<link href='http://fonts.googleapis.com/css?family=Playfair+Display:900,400|Lato:300,400,700' rel='stylesheet' type='text/css'>
			<link rel='stylesheet' type='text/css' href='/css/news.css' />
			<header id='header' class='news-header'>
				<h1>
@if(isset($tag))
					{{ $tag->name }} News on RuneTime
@else
					RuneTime News
@endif
				</h1>
				<span class='message'>
					Your mobile device does not support the slideshow feature.
				</span>
				<button class='slider-switch'>
					Switch view
				</button>
@if($canAdd)
				<div id='can-add'>
					<h2>
						<a href='/news/create'>
							Create Article
						</a>
					</h2>
				</div>
@endif
			</header>
			<div id='overlay' class='overlay'>
				<div class='info'>
					<h2>
						News Interactions
					</h2>
					<span class='info-drag'>
						Drag Sliders
					</span>
					<span class='info-keys'>
						Use Arrows
					</span>
					<span class='info-switch'>
						Switch view
					</span>
					<button>
						Got it!
					</button>
				</div>
			</div>
			<div id='slideshow' class='dragslider'>
				<section class='img-dragger img-dragger-large dragdealer'>
					<div class='handle'>
@foreach($news as $x => $newsPiece)
						<div class='slide' data-content='content-{{ $x + 1 }}'>
							<div class='img-wrap'>
								<img src='/img/news/{{ $x + 1 }}.png' alt='img{{ $x + 1 }}'/>
							</div>
							<h2>
								{{ $newsPiece->title }}
								<span>
									Tagged in @include('partials._tagged', ['tags' => $newsPiece->tags])
								</span>
							</h2>
							<button class='content-switch'>
								Read more
							</button>
						</div>
@endforeach
					</div>
				</section>
				<section class='pages'>
@foreach($news as $x => $newsPiece)
					<div class='content' data-content='content-{{ $x + 1 }}'>
						<h2>
							{{ $newsPiece->title }}
							<span>
								Tagged in @include('partials._tagged', ['tags' => $newsPiece->tags])
								<br />
								Written by <a href='{{ $newsPiece->author->toSlug() }}'>{{ $newsPiece->author->display_name }}</a>
							</span>
						</h2>
						<p>
							{!! $newsPiece->contents_parsed !!}
						</p>
						<ul class='inline list-inline'>
							<li>
								<a href='{{ $newsPiece->toSlug() }}'>
									<i class='fa fa-link'></i>
								</a>
							</li>
							<li>
								<a href='{{ $newsPiece->author->toSlug() }}'>
									<i class='fa fa-user'></i>
								</a>
							</li>
							<li>
								<a href='{{ $newsPiece->toSlug('comments') }}'>
									<i class='fa fa-comments'></i>
								</a>
							</li>
						</ul>
						<p class='related'>
							Recently the article <a href='{{ $newsPiece->toSlug() }}'>{{ $newsPiece->title }}</a> was tagged in <a href='{{ $newsPiece->tags[0]->toSlug() }}'>{{ $newsPiece->tags[0]->name }}</a>
						</p>
					</div>
@endforeach
				</section>
			</div>
		</div>
		<script>
			var news = new News();
		</script>
@stop