@extends('......layouts.default')
@section('contents')
            <div class='wrapper'>
                <h1>
                    Reporting a Post by {{$postee->display_name}} in thread {{$thread->title}}
                </h1>
@include('_edit', ['url' => '/forums/post/' . $post->id . '/report', 'id' => $post->id, 'button' => 'Report'])
            </div>
@stop