@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					{{$monster->name}}
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
						Examine
					</dt>
					<dd>
						{!! $monster->examine_parsed !!}
					</dd>
					<dt>
						Stats
					</dt>
					<dd>
						{!! $monster->stats_parsed !!}
					</dd>
					<dt>
						Location
					</dt>
					<dd>
						{!! $monster->location_parsed !!}
					</dd>
					<dt>
						Drops
					</dt>
					<dd>
						{!! $monster->drops_parsed !!}
					</dd>
					<dt>
						Membership
					</dt>
					<dd>
						{{ $monster->membership == 1 ? "Yes" : "No" }}
					</dd>
					<dt>
						Other Information
					</dt>
					<dd>
						{!! $monster->other_information_parsed !!}
					</dd>
				</dl>
			</div>
@stop