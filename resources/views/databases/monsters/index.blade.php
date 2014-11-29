@extends('layouts.default')
@section('contents')
			<div class='wrapper-dark row row-margin text-center'>
				<div class='col-xs-12'>
					<h3 class='holo-text'>
						@lang('utilities.membership.title')
					</h3>
					<ul class='list-inline holo-text-secondary'>
@foreach($memberships as $membership)
						<li>
							<a href='/databases/monsters/membership={{$membership}}' title='{{ucwords($membership)}}'>
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
				<div class='col-xs-12'>
					<a href='/databases/monsters' class='text-muted'>
						@lang('database.monsters.search.clear')
					</a>
				</div>
			</div>
			<div class='wrapper'>
				<ul class='list-inline pull-right'>
@if(\Auth::check() && \Auth::user()->isContent())
					<li>
						<a href='/databases/monsters/create' class='btn btn-sm btn-success'>
							@lang('database.monsters.create_monster')
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
								@lang('database.monsters.view.name')
							</td>
							<td>
								@lang('database.monsters.view.examine')
							</td>
							<td>
								@lang('database.monsters.view.membership')
							</td>
						</tr>
					</thead>
					<tbody>
@foreach($monsters as $monster)
						<tr onclick="">
							<td>
								img
							</td>
							<td>
								<a href='/databases/monsters/{{ \String::slugEncode($monster->id, $monster->name) }}'>
									{{ $monster->name }}
								</a>
							</td>
							<td>
								{!!$monster->examine_parsed!!}
							</td>
							<td>
								{{$monster->membership ? trans('utilities.yes') : trans('utilities.no')}}
							</td>
						</tr>
@endforeach
					</tbody>
				</table>
			</div>
@stop