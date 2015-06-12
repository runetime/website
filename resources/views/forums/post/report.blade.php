@extends('layouts.default')
@section('contents')
<div class='wrapper'>
    <h1>
        @lang('forums.post.report.title', ['author' => $post->author->display_name, 'thread' => $thread->title])
    </h1>
@include('forums.post._edit', ['url' => '/forums/post/' . $post->id . '/report', 'id' => $post->id, 'button' => 'Report'])
</div>
@stop
