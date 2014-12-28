@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					{{ $monster->name }}
				</h1>
				<p>
					<small>
						@lang('guides.written_by', ['name' => Link::name($monster->author_id), 'date' => $monster->created_at])
					</small>
					<br />
					<small>
						@lang('guides.last_updated', ['date' => Time::long($monster->updated_at)])
					</small>
					<br />
					<small>
						@lang('guides.edited_by', ['users' => $monster->getEditors()])
					</small>
				</p>
			</div>
			<div class='wrapper-dark'>
				<dl class='dl-horizontal'>
					<dt>
						@lang('database.monsters.view.examine')
					</dt>
					<dd>
						{!! $monster->examine_parsed !!}
					</dd>
					<dt>
						@lang('database.monsters.view.stats')
					</dt>
					<dd>
						{!! $monster->stats_parsed !!}
					</dd>
					<dt>
						@lang('database.monsters.view.location')
					</dt>
					<dd>
						{!! $monster->location_parsed !!}
					</dd>
					<dt>
						@lang('database.monsters.view.drops')
					</dt>
					<dd>
						{!! $monster->drops_parsed !!}
					</dd>
					<dt>
						@lang('database.monsters.view.membership')
					</dt>
					<dd>
						{{ $monster->membership == 1 ? trans('utilities.yes') : trans('utilities.no') }}
					</dd>
					<dt>
						@lang('database.monsters.view.other_information')
					</dt>
					<dd>
						{!! $monster->other_information_parsed !!}
					</dd>
				</dl>
			</div>
@stop