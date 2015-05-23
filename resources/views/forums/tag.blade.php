@extends('layouts.default')
@section('contents')
            <div class='wrapper'>
                <h1>
                    {{ $name }}
                </h1>
                <h3>
                    @lang('news.title')
                </h3>
@foreach($news as $newsPiece)
    @include('news._show', ['newsPiece' => $newsPiece])
@endforeach
                <h3>
                    @lang('forums.thread.titles')
                </h3>
@foreach($threads as $thread)
    @include('forums.subforum._thread', ['thread' => $thread])
@endforeach
            </div>
@stop
