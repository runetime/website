@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Radio Timetable
				</h1>
				<table class='table text-center'>
					<thead>
						<tr>
							<th>
								&nbsp;
							</th>
							<th class='text-center'>
								Monday
							</th>
							<th class='text-center'>
								Tuesday
							</th>
							<th class='text-center'>
								Wednesday
							</th>
							<th class='text-center'>
								Thursday
							</th>
							<th class='text-center'>
								Friday
							</th>
							<th class='text-center'>
								Saturday
							</th>
							<th class='text-center'>
								Sunday
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
					Admin.Radio = new Admin.Radio();
					Admin.Radio.Timetable = new Admin.Radio.Timetable();
					Admin.Radio.Timetable.setup();
				});
			</script>
@stop