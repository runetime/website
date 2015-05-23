@extends('layouts.default')
@section('contents')
<div class='wrapper'>
    <div class='clearfix'>
        <h1 class='pull-left'>
            {{ $ticket->name }}
        </h1>
@if(!$ticket->isClosed())
        <a href='{{ $ticket->toSlug('close') }}' class='btn btn-primary pull-right'>
            @lang('tickets.view.close_ticket')
        </a>
@endif
    </div>
    <p>
@if($ticket->status === 0)
    @lang('tickets.view.currently', ['status' => "<span class='text-success'>" . trans('tickets.status.open') . "</span>"])
@elseif($ticket->status === 1)
    @lang('tickets.view.currently', ['status' => "<span class='text-danger'>" . trans('tickets.status.closed') . "</span>"])
@elseif($ticket->status === 2)
    @lang('tickets.view.currently', ['status' => "<span class='text-warning'>" . trans('tickets.status.escalated') . "</span>"])
@else
    Error.  Please report this.
@endif
    </p>
@foreach($posts as $post)
    @include('forums.post._show', ['post' => $post])
@endforeach
@if(\Auth::check())
    @if($ticket->status !== $ticket->STATUS_CLOSED)
        @include('forums.post._edit', ['url' => '/tickets/' . \String::slugEncode($ticket->id, $ticket->name) . '/reply'])
    @else
        @include('forums.post._locked')
    @endif
@else
    @include('forums.post._auth')
@endif
</div>
@stop
