@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					@lang('staff.list.title')
				</h1>
@if(count($admins) > 0)
				<h2>
					{!! \Link::color('Administrators', 'Administrator') !!}
				</h2>
@include('staff.list.group',['staff' => $admins])
@endif
@if(count($radio) > 0)
				<h2>
					{!! \Link::color('DJ Team', 'Radio DJ') !!}
				</h2>
@include('staff.list.group',['staff' => $radio])
@endif
@if(count($media) > 0)
				<h2>
					{!! \Link::color('Media Team', 'Media Team') !!}
				</h2>
@include('staff.list.group',['staff' => $media])
@endif
@if(count($content) > 0)
				<h2>
					{!! \Link::color('Content Team', 'Content Team') !!}
				</h2>
@include('staff.list.group',['staff' => $content])
@endif
@if(count($webDev) > 0)
				<h2>
					{!! \Link::color('Web Development Team', 'Web Developer') !!}
				</h2>
@include('staff.list.group',['staff' => $webDev])
@endif
@if(count($community) > 0)
				<h2>
					{!! \Link::color('Community Team', 'Community Team') !!}
				</h2>
@include('staff.list.group',['staff' => $community])
@endif
@if(count($events) > 0)
				<h2>
					{!! \Link::color('Events Team', 'Events Team') !!}
				</h2>
@include('staff.list.group',['staff' => $events])
@endif
			</div>
			<script>
				var staffList = new StaffList();
			</script>
@stop