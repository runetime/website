@extends('layouts.forums')
@section('forum')
                <h1>
                    {{ $subforum->name }}
                </h1>
                <p class='text-muted'>
                    {!! $subforum->description !!}
                </p>
                <div class='pull-right'>
                    <ul class='list-inline'>
                        <li>
                            <a href='/forums/create/{{ \String::slugEncode($subforum->id,$subforum->name) }}' class='btn btn-primary btn-sm{{ !$subforum->canPost() ? " btn-disabled" : "" }}' role='button'>
                                @lang('forums.subforums.create_topic')
                            </a>
                        </li>
                    </ul>
                </div>
                <div class='clearfix'>
                </div>
@if(count($subforums) > 0)
    @foreach($subforums as $subforumItem)
        @include('forums.subforum._subforum', ['subforum' => $subforumItem])
    @endforeach
@endif
@if(count($threadsPinned) > 0)
    @foreach($threadsPinned as $thread)
        @include('forums.subforum._thread', ['thread' => $thread])
    @endforeach
@endif
@if(count($threads) > 0)
    @foreach($threads as $thread)
        @include('forums.subforum._thread', ['thread' => $thread])
    @endforeach
@endif
@stop
