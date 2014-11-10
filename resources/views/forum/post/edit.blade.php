@extends('layouts.default')
@section('contents')
            <div class='wrapper'>
                <h1>
                    Editing Post in {{$thread->title}}
                </h1>
@include('forum.post._edit', ['url' => '/forums/post/' . $post->id . '/edit', 'id' => $post->id, 'button' => 'Edit'])
            </div>
@stop