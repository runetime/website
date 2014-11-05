@extends('layouts.default')
@section('contents')
			<div class='wrapper-dark row row-margin'>
				<div class='col-xs-12 col-sm-4 text-center'>
					<h3 class='holo-text'>
						Difficulty
					</h3>
					<ul class='list-inline holo-text-secondary'>
@foreach($difficulties as $difficulty)
						<li>
							<a href='/guides/quests/difficulty={{$difficulty->id}}/length={{$searchLength}}/membership={{$searchMembership}}' title='{{$difficulty->name}}'>
@if($searchDifficulty==$difficulty->id)
								<b>
									{{$difficulty->name}} 
								</b>
@else
								{{$difficulty->name}} 
@endif
							</a>
						</li>
@endforeach
					</ul>
				</div>
				<div class='col-xs-12 col-sm-4 text-center'>
					<h3 class='holo-text'>
						Length
					</h3>
					<ul class='list-inline holo-text-secondary'>
@foreach($lengths as $length)
						<li>
							<a href='/guides/quests/difficulty={{$searchDifficulty}}/length={{$length->id}}/membership={{$searchMembership}}' title='{{$length->name}}'>
@if($searchLength==$length->id)
								<b>
									{{$length->name}} 
								</b>
@else
								{{$length->name}} 
@endif
							</a>
						</li>
@endforeach
					</ul>
				</div>
				<div class='col-xs-12 col-sm-4 text-center'>
					<h3 class='holo-text'>
						Membership
					</h3>
					<ul class='list-inline holo-text-secondary'>
@foreach($memberships as $membership)
						<li>
							<a href='/guides/quests/difficulty={{$searchDifficulty}}/length={{$searchLength}}/membership={{$membership->id}}' title='{{$membership->name}}'>
@if($searchMembership==$membership->id)
								<b>
									{{$membership->name}} 
								</b>
@else
								{{$membership->name}} 
@endif
							</a>
						</li>
@endforeach
					</ul>
				</div>
			</div>
			<div class='wrapper'>
				<ul class='list-inline pull-right'>
					<li>
						<a href='/guides/quests/create' class='btn btn-sm btn-success'>
							Create Guide
						</a>
					</li>
				</ul>
				<table class='table table-hover table-striped table-responsive no-border'>
					<thead>
						<tr>
							<td>
								Name
							</td>
							<td>
								Difficulty
							</td>
							<td>
								Length
							</td>
							<td>
								Quest Points
							</td>
							<td>
								Membership?
							</td>
							<td>
								Completed?
							</td>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								<a href='/guides/quests/1-all-fired-up' title='All Fired Up'>
									All Fired Up
								</a>
							</td>
							<td>
								Intermediate
							</td>
							<td>
								Short
							</td>
							<td>
								1
							</td>
							<td>
								Yes
							</td>
							<td>
								No
							</td>
						</tr>
						<tr>
							<td>
								<a href='/guides/quests/1-all-fired-up' title='All Fired Up'>
									Animal Magnetism
								</a>
							</td>
							<td>
								Intermediate
							</td>
							<td>
								Medium
							</td>
							<td>
								1
							</td>
							<td>
								Yes
							</td>
							<td>
								No
							</td>
						</tr>
					</tbody>
				</table>
			</div>
@stop