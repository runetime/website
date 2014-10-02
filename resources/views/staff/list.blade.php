@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h3>
					{!!Link::color('Administrators','Administrator')!!}
				</h3>
@include('staff.list.table',['staff'=>$admins])
				<h3>
					{!!Link::color('Community Team','Community Team')!!}
				</h3>
@include('staff.list.table',['staff'=>$community])
@include('staff.list.table',['staff'=>$events])
				<h3>
					{!!Link::color('Content Team','Content Team')!!}
				</h3>
@include('staff.list.table',['staff'=>$webDev])
@include('staff.list.table',['staff'=>$content])
				<h3>
					{!!Link::color('Media Team','Media Team')!!}
				</h3>
@include('staff.list.table',['staff'=>$radio])
@include('staff.list.table',['staff'=>$media])
			</div>
@stop