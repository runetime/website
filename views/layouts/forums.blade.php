@extends('layouts.default')
@section('contents')
<?php
$layoutSubforumRepository = \App::make('App\RuneTime\Forum\Subforums\SubforumRepository');
$layoutSubforumList = $layoutSubforumRepository->getByParent(-1);
?>
			<div class='wrapper'>
				<div class='row'>
					<div class='col-xs-12 col-md-3 col-lg-2'>
						<div class='subforum-list'>
@foreach($layoutSubforumList as $layoutSubforum)
	@if(empty(json_decode($layoutSubforum->roles)) || \Auth::check() && in_array(\Auth::user()->importantRole()->id, json_decode($layoutSubforum->roles)))
		@if($layoutSubforum->id === $subforum->id || $layoutSubforum->id === $subforum->parent)
							<a href='/forums/{{ \String::slugEncode($layoutSubforum->id, $layoutSubforum->name) }}' class='active'>
		@else
							<a href='/forums/{{ \String::slugEncode($layoutSubforum->id, $layoutSubforum->name) }}'>
		@endif
								{{ $layoutSubforum->name }}
							</a>
	@endif
@endforeach
						</div>
					</div>
					<div class='col-xs-12 col-md-9 col-lg-10'>
@yield('forum')
					</div>
				</div>
			</div>
@stop