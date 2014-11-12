@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Manage Tickets
				</h1>
				<h3 class='text-success'>
					Open Tickets
				</h3>
@if(count($ticketsOpen) > 0)
	@foreach($ticketsOpen as $ticket)
		@include('tickets._card', ['ticket' => $ticket])
	@endforeach
@else
				<p class='text-info'>
					<em>
						There are currently no open tickets.
					</em>
				</p>
@endif
				<h3 class='text-danger'>
					Closed Tickets
				</h3>
@if(count($ticketsClosed) > 0)
	@foreach($ticketsClosed as $ticket)
		@include('tickets._card', ['ticket' => $ticket])
	@endforeach
@else
				<p class='text-info'>
					<em>
						There are currently no closed tickets.
					</em>
				</p>
@endif
			</div>
@stop