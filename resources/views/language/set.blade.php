@extends('...layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Set Your Language
				</h1>
				<h3>
					Available Languages
				</h3>
@foreach($languagesDone as $initials => $name)
	@include('language._show', ['initials' => $initials, 'name' => $name, 'done' => true])
@endforeach
				<h3>
					Work In Progress Languages
				</h3>
@foreach($languagesWIP as $initials => $name)
	@include('language._show', ['initials' => $initials, 'name' => $name])
@endforeach
			</div>
@stop