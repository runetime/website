@extends('layouts.default')
@section('contents')
			<div class='wrapper-dark'>
				<h1>
					{{$guide->name}}
				</h1>
				<p>
					<small>
						@lang('guides.written_by',['name'=>Link::name($guide->author_id),'date'=>$guide->created_at]) 
					</small>
					<br />
					<small>
						@lang('guides.last_updated',['date'=>Time::long($guide->updated_at)]) 
					</small>
					<br />
					<small>
						@lang('guides.edited_by',['users'=>$editList]) 
					</small>
				</p>
			</div>
			<div class='wrapper'>
				{!!$guide->contents_parsed!!}
			</div>
@stop