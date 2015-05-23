@extends('layouts.default')
@section('contents')
<div class='wrapper'>
    <h1>
        @lang('tickets.manage.title')
    </h1>
@if(\Auth::user()->isAdmin())
    <h3 class='text-warning'>
        Escalated Tickets
    </h3>
    @if(count($ticketsEscalated) > 0)
        @foreach($ticketsEscalated as $ticket)
            @include('tickets._card', ['ticket' => $ticket])
        @endforeach
    @else
        <p class='text-info'>
            <em>
                @lang('tickets.manage.none', ['status' => Lang::get('tickets.status.escalated')])
            </em>
        </p>
    @endif
@endif
    <h3 class='text-success'>
        @lang('tickets.manage.tickets_open')
    </h3>
@if(count($ticketsOpen) > 0)
    @foreach($ticketsOpen as $ticket)
        @include('tickets._card', ['ticket' => $ticket])
    @endforeach
@else
    <p class='text-info'>
        <em>
            @lang('tickets.manage.none', ['status' => Lang::get('tickets.status.open')])
        </em>
    </p>
@endif
    <h3 class='text-danger'>
        @lang('tickets.manage.tickets_closed')
    </h3>
@if(count($ticketsClosed) > 0)
    @foreach($ticketsClosed as $ticket)
        @include('tickets._card', ['ticket' => $ticket])
    @endforeach
@else
    <p class='text-info'>
        <em>
            @lang('tickets.manage.none', ['status' => Lang::get('tickets.status.closed')])
        </em>
    </p>
@endif
</div>
@stop
