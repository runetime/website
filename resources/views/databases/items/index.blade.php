@extends('layouts.default')
@section('contents')
			<div class='wrapper-dark row row-margin text-center'>
				<div class='col-xs-12 col-sm-4'>
					<h3 class='holo-text'>
						@lang('database.items.search.membership')
					</h3>
					<ul class='list-inline holo-text-secondary'>
@foreach($memberships as $membership)
						<li>
							<a href='/databases/items/membership={{ $membership }}/tradable={{ $searchTradable }}/questItem={{ $searchQuestItem }}' title='{{ ucwords($membership) }}'>
@if($searchMembership == $membership)
								<b>
									{{ ucwords($membership) }}
								</b>
@else
							{{ ucwords($membership) }}
@endif
							</a>
						</li>
@endforeach
					</ul>
				</div>
				<div class='col-xs-12 col-sm-4'>
					<h3 class='holo-text'>
						@lang('database.items.search.tradable')
					</h3>
					<ul class='list-inline holo-text-secondary'>
@foreach($tradables as $tradable)
						<li>
							<a href='/databases/items/membership={{ $searchMembership }}/tradable={{ $tradable }}/questItem={{ $searchQuestItem }}' title='{{ ucwords($tradable) }}'>
@if($searchTradable == $tradable)
								<b>
									{{ ucwords($tradable) }}
								</b>
@else
							{{ ucwords($tradable) }}
@endif
							</a>
						</li>
@endforeach
					</ul>
				</div>
				<div class='col-xs-12 col-sm-4'>
					<h3 class='holo-text'>
						@lang('database.items.search.quest_item')
					</h3>
					<ul class='list-inline holo-text-secondary'>
@foreach($questItems as $questItem)
						<li>
							<a href='/databases/items/membership={{ $searchMembership }}/tradable={{ $searchTradable }}/questItem={{ $questItem }}' title='{{ ucwords($questItem) }}'>
@if($searchQuestItem == $questItem)
								<b>
									{{ ucwords($questItem) }}
								</b>
@else
							{{ ucwords($questItem) }}
@endif
							</a>
						</li>
@endforeach
					</ul>
				</div>
                <div class='col-xs-12'>
                    <a href='/databases/items' class='text-muted'>
                        @lang('database.items.search.clear')
                    </a>
                </div>
			</div>
			<div class='wrapper'>
				<ul class='list-inline pull-right'>
@if(\Auth::check() && \Auth::user()->isContent())
					<li>
						<a href='/databases/items/create' class='btn btn-sm btn-success'>
							@lang('database.items.create_item')
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
								@lang('database.items.table.name')
							</td>
							<td>
								@lang('database.items.table.examine')
							</td>
							<td>
								@lang('database.items.table.membership')
							</td>
							<td>
								@lang('database.items.table.tradable')
							</td>
							<td>
								@lang('database.items.table.quest_item')
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
								{{ $item->membership ? trans('utilities.yes') : trans('utilities.no') }}
							</td>
							<td>
								{{ $item->tradable ? trans('utilities.yes') : trans('utilities.no') }}
							</td>
							<td>
								{{ $item->quest_item ? trans('utilities.yes') : trans('utilities.no') }}
							</td>
						</tr>
@endforeach
					</tbody>
				</table>
			</div>
@stop