@extends('.........layouts.default')
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
					@lang('staff.moderation.reports.view.currently', ['status' => Lang::get('staff.moderation.reports.status.open')])
				</p>
@else
				<p class='text-danger'>
					@lang('staff.moderation.reports.view.currently', ['status' => Lang::get('staff.moderation.reports.status.closed')])
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