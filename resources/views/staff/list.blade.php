@extends('...layouts.default')
@section('contents')
			<div class='wrapper'>
@if(!empty($admins))
				<h2>
					{!!Link::color('Administrators','Administrator')!!}
				</h2>
@include('list.group',['staff'=>$admins])
@endif
@if(!empty($radio))
				<h2>
					{!!Link::color('DJ Team','Radio DJ')!!}
				</h2>
@include('list.group',['staff'=>$radio])
@endif
@if(!empty($media))
				<h2>
					{!!Link::color('Media Team','Media Team')!!}
				</h2>
@include('list.group',['staff'=>$media])
@endif
@if(!empty($content))
				<h2>
					{!!Link::color('Content Team','Content Team')!!}
				</h2>
@include('list.group',['staff'=>$content])
@endif
@if(!empty($webDev))
				<h2>
					{!!Link::color('Web Development Team','Web Developer')!!}
				</h2>
@include('list.group',['staff'=>$webDev])
@endif
@if(!empty($community))
				<h2>
					{!!Link::color('Community Team','Community Team')!!}
				</h2>
@include('list.group',['staff'=>$community])
@endif
@if(!empty($events))
				<h2>
					{!!Link::color('Events Team','Events Team')!!}
				</h2>
@include('list.group',['staff'=>$events])
@endif
			</div>
@stop