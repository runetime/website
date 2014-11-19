@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Notification in {{ $notification->section }}
				</h1>
				<p class='text-muted'>
					{{ \Time::shortReadable($notification->created_at) }}
				</p>
				<div class='well well-sm'>
					{!! $notification->contents_parsed !!}
				</div>
			</div>
@stop