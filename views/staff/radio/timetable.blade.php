@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					@lang('staff.radio.timetable.title')
				</h1>
				<table class='table text-center'>
					<thead>
						<tr>
							<th>
								&nbsp;
							</th>
							<th class='text-center'>
								@lang('utilities.time.day.monday')
							</th>
							<th class='text-center'>
								@lang('utilities.time.day.tuesday')
							</th>
							<th class='text-center'>
								@lang('utilities.time.day.wednesday')
							</th>
							<th class='text-center'>
								@lang('utilities.time.day.thursday')
							</th>
							<th class='text-center'>
								@lang('utilities.time.day.friday')
							</th>
							<th class='text-center'>
								@lang('utilities.time.day.saturday')
							</th>
							<th class='text-center'>
								@lang('utilities.time.day.sunday')
							</th>
						</tr>
					</thead>
					<tbody>
@foreach(range(0, 23) as $hour)
						<tr>
							<td>
								{{ $hour }}:00
							</td>
	@foreach(range(0, 6) as $day)
							<td>
		@if($days[$day][$hour] == -1 || $days[$day][$hour] == \Auth::user()->display_name)
								<a rt-data='radio.panel.timetable:update.hour' rt-data2='{{ $day }}:{{ $hour }}'>
									{{ $days[$day][$hour] == -1 ? "-" : $days[$day][$hour] }}
								</a>
		@else
								{{ $days[$day][$hour] == -1 ? "-" : $days[$day][$hour] }}
		@endif
							</td>
	@endforeach
						</tr>
@endforeach
					</tbody>
				</table>
			</div>
			<script>
				$(function() {
					admin.radio = new AdminRadio();
					admin.radio.timetable = new AdminTimetable();
				});
			</script>
@stop