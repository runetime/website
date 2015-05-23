@extends('layouts.default')
@section('contents')
            <div class='wrapper'>
                <h1>
                    @lang('forums.post.edit.title', ['thread' => $thread->title])
                </h1>
@include('forums.post._edit', ['url' => '/forums/post/' . $post->id . '/edit', 'button' => 'Edit', 'contents' => $post->contents])
            </div>
@stop
