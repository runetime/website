@extends('layouts.default')
@section('contents')
<div class='wrapper wrapper-flat'>
    <div class='row row-flat'>
        <div class='col-xs-12 col-sm-8 col-md-9'>
            <h2>
                @lang('news.title')
            </h2>
@foreach($news as $newsPiece)
    @include('news._show', ['newsPiece' => $newsPiece])
@endforeach
        </div>
        <div class='col-xs-12 col-sm-4 col-md-3 section-light'>
            <h3>
                @lang('home.status_updates')
            </h3>
@foreach($statuses as $status)
            <div class='card row row-flat'>
                <div class='col-xs-3 col-md-2 padding-none'>
                    {!! \Image::userPhoto($status->author->id, ['center-block']) !!}
                </div>
                <div class='col-xs-9 col-md-10 clearfix'>
                    <div class='pull-right'>
                        <a href='/forums/statuses/{{ \String::slugEncode($status->id, 'by-', $status->author->display_name) }}' title='View Status by {{ $status->author->display_name }}'>
                            {{ \Time::monthDay($status->created_at) }}
                        </a>
                    </div>
                    {!! \Link::name($status->author->id) !!}
                    <br />
                    <p class='inline'>{!! $status->posts[0]->contents_parsed !!}</p>
                    <a href='/forums/statuses/{{ \String::slugEncode($status->id, 'by-', $status->author->display_name) }}#comments'>
                        @lang('utilities.read_comments_amount', ['amount' => $status->reply_count - 1])
                    </a>
                </div>
            </div>
@endforeach
            <p class='text-center'>
                <a href='/forums/statuses' class='text-muted'>
                    @lang('home.all_statuses')
                </a>
            </p>
            <h3>
                @lang('forums.sidebar.recent_threads.name')
            </h3>
@if(!empty($threads))
    @foreach($threads as $thread)
            <div class='card row row-flat'>
                <div class='col-xs-3 col-md-2 padding-none'>
                    {!! \Image::userPhoto($thread->author_id, ['img-responsive', 'pull-left']) !!}
                </div>
                <div class='col-xs-9 col-md-10'>
                    <a href='/forums/thread/{{ \String::slugEncode($thread->id, $thread->title) }}' title='{{ $thread->title }}'>
                        {{ $thread->title }}
                    </a>
                    <br />
                    {!! \Link::name($thread->author_id) !!}, <span class='text-muted'>{{ \Time::shortReadable($thread->created_at) }}</span>
                </div>
            </div>
    @endforeach
@endif
            <h3>
                @lang('forums.sidebar.recent_posts.name')
            </h3>
@if(!empty($posts))
    @foreach($posts as $post)
            <div class='card row row-flat'>
                <div class='col-xs-3 col-md-2 padding-none'>
                    {!! \Image::userPhoto($post->author_id, ['img-responsive', 'pull-left']) !!}
                </div>
                <div class='col-xs-9 col-md-10'>
                    <a href='/forums/thread/{{ \String::slugEncode($post->thread[0]->id, $post->thread[0]->title) }}' title='{{ $post->thread[0]->title }}'>
                        {{ $post->thread[0]->title }}
                    </a>
                    <br />
                    {!! \Link::name($post->author_id) !!}, <span class='text-muted'>{{ \Time::shortReadable($post->created_at) }}</span>
                </div>
            </div>
    @endforeach
@endif
        </div>
    </div>
</div>
@stop
