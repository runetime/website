@extends('layouts.default')
@section('contents')
<?php
use App\RuneTime\Awards\Award;
?>
			<div class='wrapper'>
				<h2>
					RuneTime Awards
				</h2>
@foreach($awards as $award)
				<div class='award-list row'>
					<div class='col-xs-2 col-sm-2'>
						<img src='{{Link::URL('img/awards/'.$award->id.'.png')}}' alt='{{$award->name}}' class='img-responsive' />
					</div>
					<div class='col-xs-10 col-sm-6'>
						<h5>
							{{$award->name}} 
						</h5>
						<p>
							{{$award->description}} 
						</p>
					</div>
					<div class='col-xs-12 col-sm-4'>
						<p>
							@lang('awards.times_awarded',['amount'=>$award->given]) <a href='{{Link::URL('awards/'.Award::makeSlug($award->id,$award->name))}}' title='View Awardees'>View Awardees</a>
						</p>
						<p>
							@lang('awards.last_awarded',['time'=>Time::long($award->last_awarded)]) 
						</p>
					</div>
				</div>
@endforeach
			</div>
@stop