@extends('layouts.default')
@section('contents')
			<div class='wrapper-dark'>
				<div class='row row-margin'>
					<div class='col-xs-12 col-sm-4 text-center'>
						<h3 class='holo-text'>
							Membership
						</h3>
						<ul class='list-inline holo-text-secondary'>
@foreach($memberships as $membership)
							<li>
								<a href='/databases/items/membership={{$membership}}/tradable={{$searchTradable}}/questItem={{$searchQuestItem}}' title='{{ucwords($membership)}}'>
@if($searchMembership == $membership)
									<b>
										{{ucwords($membership)}}
									</b>
@else
								{{ucwords($membership)}}
@endif
								</a>
							</li>
@endforeach
						</ul>
					</div>
					<div class='col-xs-12 col-sm-4 text-center'>
						<h3 class='holo-text'>
							Tradable
						</h3>
						<ul class='list-inline holo-text-secondary'>
@foreach($tradables as $tradable)
							<li>
								<a href='/databases/items/membership={{$searchMembership}}/tradable={{$tradable}}/questItem={{$searchQuestItem}}' title='{{ucwords($tradable)}}'>
@if($searchTradable == $tradable)
									<b>
										{{ucwords($tradable)}}
									</b>
@else
								{{ucwords($tradable)}}
@endif
								</a>
							</li>
@endforeach
						</ul>
					</div>
					<div class='col-xs-12 col-sm-4 text-center'>
						<h3 class='holo-text'>
							Quest Item
						</h3>
						<ul class='list-inline holo-text-secondary'>
@foreach($questItems as $questItem)
							<li>
								<a href='/databases/items/membership={{$searchMembership}}/tradable={{$searchTradable}}/questItem={{$questItem}}' title='{{ucwords($questItem)}}'>
@if($searchQuestItem == $questItem)
									<b>
										{{ucwords($questItem)}}
									</b>
@else
								{{ucwords($questItem)}}
@endif
								</a>
							</li>
@endforeach
						</ul>
					</div>
				</div>
			</div>
			<div class='wrapper'>
				<ul class='list-inline pull-right'>
@if(\Auth::check() && \Auth::user()->isContent())
					<li>
						<a href='/databases/items/create' class='btn btn-sm btn-success'>
							Create Item
						</a>
					</li>
@endif
				</ul>
				<table class='table table-hover table-striped table-responsive no-border'>
					<thead>
						<tr>
							<td>
								&nbsp;
							</td>
							<td>
								Name
							</td>
							<td>
								Examine
							</td>
							<td>
								Membership
							</td>
							<td>
								Tradable
							</td>
							<td>
								Quest Item
							</td>
						</tr>
					</thead>
					<tbody>
@foreach($items as $item)
						<tr>
							<td>
								img
							</td>
							<td>
								<a href='/databases/items/{{ \String::slugEncode($item->id, $item->name) }}'>
									{{ $item->name }}
								</a>
							</td>
							<td>
								{!! $item->examine_parsed !!}
							</td>
							<td>
								{{ $item->membership ? "Yes" : "No" }}
							</td>
							<td>
								{{ $item->tradable ? "Yes" : "No" }}
							</td>
							<td>
								{{ $item->quest_item ? "Yes" : "No" }}
							</td>
						</tr>
@endforeach
					</tbody>
				</table>
			</div>
@stop