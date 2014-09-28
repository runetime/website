@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h3>
					Administrators
				</h3>
@include('staff.list.table',['staff'=>$admins])
				<h3>
					Community Team
				</h3>
@include('staff.list.table',['staff'=>$community])
@include('staff.list.table',['staff'=>$events])
				<h3>
					Content Team
				</h3>
@include('staff.list.table',['staff'=>$webDev])
@include('staff.list.table',['staff'=>$content])
				<h3>
					Media Team
				</h3>
@include('staff.list.table',['staff'=>$radio])
@include('staff.list.table',['staff'=>$media])
			</div>
@stop