@extends('layouts.default')
@section('contents')
<div class='wrapper'>
    <h1>
        {{ $message->title }}
    </h1>
@foreach($posts as $post)
    @include('forums.post._show', ['post' => $post])
@endforeach
@include('forums.post._edit', ['url' => '/messenger/' . \String::slugEncode($message->id, $message->title) . '/reply'])
</div>
@stop
