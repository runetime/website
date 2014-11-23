@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h2>
					@lang('awards.name')
				</h2>
@foreach($awards as $award)
				<div class='award-list row'>
					<div class='col-xs-2 col-sm-2'>
						<img src='/img/awards/{{ $award->id }}.png' alt='{{ $award->name }}' class='img-responsive' />
					</div>
					<div class='col-xs-10 col-sm-6'>
						<h5>
							{{ $award->name }}
						</h5>
						<p>
							{{ $award->description }}
						</p>
					</div>
					<div class='col-xs-12 col-sm-4'>
						<p>
							@lang('awards.times_awarded', ['amount' => count($award->users)]) <a href='/awards/{{ \String::slugEncode($award->id, $award->name) }}' title='@lang('awards.view_awardees')'>@lang('awards.view_awardees')</a>
						</p>
						<p>
@if(!empty($award->lastAwarded))
							@lang('awards.last_awarded', ['time' => \Time::long($award->last_awarded)])
@endif
						</p>
					</div>
				</div>
@endforeach
			</div>
@stop