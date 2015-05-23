@extends('layouts.default')
@section('contents')
            <div class='wrapper'>
                <h1>
                    @lang('tickets.title')
                </h1>
                <ul class='pull-right list-inline'>
                    <li>
                        <a href='/tickets/create' class='btn btn-primary btn-sm'>
                            @lang('tickets.create_ticket')
                        </a>
                    </li>
                </ul>
                <h3 class='text-success'>
                    @lang('tickets.index.tickets_open')
                </h3>
@if(!empty($ticketList[0]))
    @foreach($ticketList[0] as $ticket)
        @include('tickets._card', ['ticket' => $ticket])
    @endforeach
@else
                <p class='text-info'>
                    <em>
                        @lang('tickets.index.no_open')
                    </em>
                </p>
@endif
                <h3 class='text-danger'>
                    @lang('tickets.index.tickets_closed')
                </h3>
@if(!empty($ticketList[1]))
    @foreach($ticketList[1] as $ticket)
        @include('tickets._card', ['ticket' => $ticket])
    @endforeach
@else
                <p class='text-info'>
                    <em>
                        @lang('tickets.index.no_closed')
                    </em>
                </p>
@endif
            </div>
@stop
