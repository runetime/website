@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
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
			<div class='wrapper-dark'>
				<dl class='dl-horizontal'>
					<dt>
						Description
					</dt>
					<dd>
						{!!$guide->description!!}
					</dd>
					<dt>
						Difficulty
					</dt>
					<dd>
						{{$difficulty->name}} 
					</dd>
					<dt>
						Length
					</dt>
					<dd>
						{{$length->name}} 
					</dd>
					<dt>
						Quest Points
					</dt>
					<dd>
						<img src='/img/guides/quests/qp.png' alt='QP' /> {{$guide->qp}} 
					</dd>
					<dt>
						Membership
					</dt>
					<dd>
						{{$guide->membership == 1 ? "Yes" : "No"}}
					</dd>
					<dt>
						Quest Requirements
					</dt>
					<dd>
						{!!$guide->quest_requirements!!}
					</dd>
					<dt>
						Skill Requirements
					</dt>
					<dd>
						{!!$guide->skill_requirements!!}
					</dd>
					<dt>
						Items Required
					</dt>
					<dd>
						{!!$guide->items_required!!}
					</dd>
					<dt>
						Items Recommended
					</dt>
					<dd>
						{!!$guide->items_recommended!!}
					</dd>
					<dt>
						Rewards
					</dt>
					<dd>
						{!!$guide->rewards!!}
					</dd>
					<dt>
						Starting Point
					</dt>
					<dd>
						{!!$guide->starting_point!!}
					</dd>
				</dl>
			</div>
			<div class='wrapper'>
				{!!$guide->contents_parsed!!}
			</div>
@stop