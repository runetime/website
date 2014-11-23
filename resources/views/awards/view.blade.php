@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					{{ $award->name }}
				</h1>
				<p class='text-muted'>
					{!! $award->description !!}
				</p>
				<table class='table'>
					<thead>
						<tr>
							<td>
								&nbsp;
							</td>
							<td>
								Name
							</td>
							<td>
								Title
							</td>
						</tr>
					</thead>
					<tbody>
@foreach($awardees as $awardee)
						<tr>
							<td>
								{!! \Image::userPhoto($awardee->id) !!}
							</td>
							<td>
								{{ $awardee->display_name }}
							</td>
							<td>
								{{ $awardee->title }}
							</td>
						</tr>
@endforeach
					</tbody>
				</table>
			</div>
@stop