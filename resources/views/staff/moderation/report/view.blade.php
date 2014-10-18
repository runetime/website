@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Viewing Report by {{$author->display_name}}
				</h1>
				<p class='text-muted'>
					Submitted on {{\Time::shortReadable($report->created_at)}}
				</p>
@if($status == "open")
				<p class='text-success'>
					The report is currently <b>open</b>.
				</p>
@else
				<p class='text-danger'>
					The report is currently <b>closed</b>.
				</p>
@endif
				<div class='post'>

				</div>
				<div class='pull-right'>
					<ul class='list-inline'>
						<li>

						</li>
					</ul>
				</div>
			</div>
@stop