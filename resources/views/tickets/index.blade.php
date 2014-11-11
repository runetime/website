@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					My Tickets
				</h1>
				<ul class='pull-right list-inline'>
					<li>
						<a href='/tickets/create' class='btn btn-primary btn-sm'>
							Create Ticket
						</a>
					</li>
				</ul>
				<h3 class='text-success'>
					Open Tickets
				</h3>
@if(!empty($ticketList[0]))
	@foreach($ticketList[0] as $ticket)
		@include('tickets._card', ['ticket' => $ticket])
	@endforeach
@else
				<p class='text-info'>
					<em>
						You have no open tickets currently.
					</em>
				</p>
@endif
				<h3 class='text-danger'>
					Closed Tickets
				</h3>
@if(!empty($ticketList[1]))
	@foreach($ticketList[1] as $ticket)
		@include('tickets._card', ['ticket' => $ticket])
	@endforeach
@else
				<p class='text-info'>
					<em>
						You have no closed tickets currently.
					</em>
				</p>
@endif
			</div>
@stop