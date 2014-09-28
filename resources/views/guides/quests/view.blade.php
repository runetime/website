@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					{{$guide->name}}
				</h1>
				<p>
					<small>
						@lang('guides.written_by',['name'=>Link::linkName($guide->author_id),'date'=>$guide->created_at]) 
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
				<dl class='dl-horizontal'>
					<dt>
						Description
					</dt>
					<dd>
						{{$guide->description}} 
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
						{{$guide->membership==1?"Yes":"No"}} 
					</dd>
					<dt>
						Quest Requirements
					</dt>
					<dd>
						<ul class='list-unstyled'>
@foreach(json_decode($guide->quest_requirements) as $requirement)
							<li>
								<a href='/guides/quests/{{String::slug($requirement->id,$requirement->name)}}' title='{{$requirement->name}}'>
									{{$requirement->name}} 
								</a>
							</li>
@endforeach
						</ul>
					</dd>
					<dt>
						Skill Requirements
					</dt>
					<dd>
						<ul class='list-unstyled'>
@foreach(json_decode($guide->skill_requirements) as $name=>$level)
							<li>
								<img src='/img/skills/{{strtolower($name)}}.png' alt='{{$name}} Image' />{{$level}} {{$name}} 
							</li>
@endforeach
						</ul>
					</dd>
					<dt>
						Items Required
					</dt>
					<dd>
						<ul class='list-unstyled'>
@foreach(json_decode($guide->items_required) as $item)
							<li>
	@if($item->id>0)
								?
	@else
								{{$item->amount}} {{$item->description}} 
	@endif
							</li>
@endforeach
						</ul>
					</dd>
					<dt>
						Items Recommended
					</dt>
					<dd>
						<ul class='list-unstyled'>
@foreach(json_decode($guide->items_recommended) as $item)
							<li>
	@if($item->id>0)
								?
	@else
								{{$item->amount}} {{$item->description}} 
	@endif
							</li>
@endforeach
						</ul>
					</dd>
					<dt>
						Rewards
					</dt>
					<dd>
						<ul class='list-unstyled'>
@foreach(json_decode($guide->rewards) as $reward)
							<li>
	@if($reward->id>0)
								?
	@else
								{{$reward->amount>0?number_format($reward->amount)." ":""}}{{$reward->description}} 
	@endif
							</li>
@endforeach
						</ul>
					</dd>
					<dt>
						Starting Point
					</dt>
					<dd>
						{{$guide->starting_point}} 
					</dd>
				</dl>
@foreach($guide->contents as $x=>$step)
				<h3>
					Step {{$x}} 
				</h3>
				<p>
					{{$step}} 
				</p>
@endforeach
			</div>
@stop