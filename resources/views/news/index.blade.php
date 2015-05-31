@extends('layouts.app')
@section('app')
<div id='news'>
    <link href='http://fonts.googleapis.com/css?family=Playfair+Display:900,400|Lato:300,400,700' rel='stylesheet' type='text/css'>
    <link rel='stylesheet' type='text/css' href='/css/news.css' />
    <header id='header' class='news-header'>
        <h1>
@if(isset($tag) && !empty($tag))
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
@foreach($news as $newsPiece)
                <div class='slide' data-content='content-{{ $newsPiece->id }}'>
                    <div class='img-wrap'>
                        <img src='/img/news/{{ $newsPiece->id }}.png' alt='img{{ $newsPiece->id }}'/>
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
@foreach($news as $newsPiece)
            <div class='content' data-content='content-{{ $newsPiece->id }}'>
                <h2 class='article-header'>
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
                <ul class='inline list-inline article-links'>
                    <li>
                        <a href='{{ $newsPiece->toSlug() }}' title='Link to Article'>
                            <i class='fa fa-link'></i>
                        </a>
                    </li>
                    <li>
                        <a href='{{ $newsPiece->author->toSlug() }}' title="Author's Profile">
                            <i class='fa fa-user'></i>
                        </a>
                    </li>
                    <li>
                        <a href='{{ $newsPiece->toSlug('comments') }}' title='Article Comments'>
                            <i class='fa fa-comments'></i>
                        </a>
                    </li>
                </ul>
                <p class='related'>
                    This article was written by <a href='{{ $newsPiece->author->toSlug() }}'>{{ $newsPiece->author->display_name }}</a> on the {{ \Time::DMYFull($newsPiece->created_at) }}
                </p>
                <p>
                    Comments
                </p>
    @if(\Auth::check())
        @include('news._editor', ['news' => $newsPiece])
    @endif

    @foreach($newsPiece->posts as $post)
        @include('news._comment', ['post' => $post])
    @endforeach
                <p>

                </p>
            </div>
@endforeach
        </section>
    </div>
</div>
<script>
    var news = new News();
@if(isset($comments) && $comments == true)
    news.toComments({{ $id }});
@endif
</script>
@stop
