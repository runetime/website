@extends('layouts.default')
@section('contents')
            <div class='wrapper'>
                <div class='clearfix'>
                    <h1 class='pull-left'>
                        @lang('forums.statuses.index.title')
                    </h1>
@if(\Auth::check())
                    <a href='/forums/statuses/create' class='btn btn-sm btn-primary pull-right'>
                        @lang('forums.statuses.create.title')
                    </a>
@endif
                </div>
@foreach($statusList as $status)
                <div class='card row row-flat'>
                    <div class='col-xs-3 col-sm-2 col-md-1 padding-none'>
                        {!! \Image::userPhoto($status->author->id, ['center-block']) !!}
                    </div>
                    <div class='col-xs-9 col-sm-10 col-md-11'>
                        {!! \Link::name($status->author->id) !!} <span class='text-muted'>{{ \Time::shortReadable($status->created_at) }}</span>
                        <br />
                        <p class='inline'>{!! $status->posts[0]->contents_parsed !!}</p>
                        <ul class='list-inline'>
                            <li>
                                <a href='/forums/statuses/{{ \String::slugEncode($status->id, 'by-', $status->author->display_name) }}'>
                                    @lang('utilities.read_more')
                                </a>
                            </li>
                            <li>
                                <a href='/forums/statuses/{{ \String::slugEncode($status->id, 'by-', $status->author->display_name) }}#comments'>
                                    @lang('utilities.replies_amount', ['amount' => $status->reply_count - 1])
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
@endforeach
            </div>
@stop
