@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					@lang('staff.moderation.name')
				</h1>
				<div class='row'>
					<div class='col-xs-12 col-sm-6 col-md-3'>
						<h2>
							@lang('staff.moderation.reports.open_reports')
						</h2>
@foreach($reportList as $report)
                        <div class='card card-bad card-link' onclick="window.location.href='/staff/moderation/report/{{$report->id}}';">
                            <h4>
                                {{$report->author->display_name}}
                            </h4>
                            <p>
                                @lang('staff.moderation.reports.reported_desc')
                                <a href='/forum/threads/{{\String::slugEncode($report->post->thread[0]->id, $report->post->thread[0]->title)}}' title='{{$report->post->thread[0]->title}}'>
                                    {{ $report->post->thread[0]->title }}
                                </a>
                            </p>
                            <p class='text-muted'>
                                @lang('staff.moderation.reports.reported_at', ['date' => \Time::shortTime($report->created_at)])
                            </p>
                        </div>
@endforeach
					</div>
				</div>
			</div>
@stop