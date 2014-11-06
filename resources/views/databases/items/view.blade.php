@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					{{$item->name}}
				</h1>
				<p>
					<small>
						@lang('guides.written_by', ['name' => Link::name($item->author_id), 'date' => $item->created_at])
					</small>
					<br />
					<small>
						@lang('guides.last_updated', ['date' => Time::long($item->updated_at)])
					</small>
					<br />
					<small>
						@lang('guides.edited_by', ['users' => $item->getEditors()])
					</small>
				</p>
			</div>
			<div class='wrapper-dark'>
				<dl class='dl-horizontal'>
					<dt>
						Examine
					</dt>
					<dd>
						{!! $item->examine_parsed !!}
					</dd>
					<dt>
						Membership
					</dt>
					<dd>
						{{ $item->membership == 1 ? "Yes" : "No" }}
					</dd>
					<dt>
						Tradable
					</dt>
					<dd>
						{{ $item->tradable == 1 ? "Yes" : "No" }}
					</dd>
					<dt>
						Quest Item
					</dt>
					<dd>
						{{ $item->quest_item == 1 ? "Yes" : "No" }}
					</dd>
				</dl>
			</div>
@stop