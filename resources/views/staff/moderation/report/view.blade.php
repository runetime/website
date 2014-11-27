@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					@lang('staff.moderation.reports.view.viewing', ['name' => \Link::name($author->id)])
				</h1>
				<p class='text-muted'>
					@lang('staff.moderation.reports.view.submitted_on', ['date' => \Time::shortReadable($report->created_at)])
				</p>
@if($status == "open")
				<p class='text-success'>
					@lang('staff.moderation.reports.view.currently', ['status' => trans('staff.moderation.reports.status.open')])
				</p>
@else
				<p class='text-danger'>
					@lang('staff.moderation.reports.view.currently', ['status' => trans('staff.moderation.reports.status.closed')])
				</p>
@endif
@foreach($posts as $post)
	@include('forums.post._show', ['post' => $post])
@endforeach
				<div class='clearfix'>
					<div class='pull-right'>
						<ul class='list-inline'>
							<li>
								<a href='/staff/moderation/report/1/status/switch' class='btn btn-info'>
									{{ $report->status == 0 ? trans('staff.moderation.reports.report_close') : trans('staff.moderation.reports.report_open') }}
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
@stop