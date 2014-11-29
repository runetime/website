@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					@lang('language.set.title')
				</h1>
				<h3>
					@lang('language.set.available')
				</h3>
@foreach($languagesDone as $initials)
	@include('language._show', ['initials' => $initials, 'name' => trans('language.languages.' . $initials), 'done' => true])
@endforeach
				<h3>
					@lang('language.set.wip')
				</h3>
@foreach($languagesWIP as $initials)
	@include('language._show', ['initials' => $initials, 'name' => trans('language.languages.' . $initials)])
@endforeach
			</div>
@stop