@if(!isset($include))
@extends('layouts.default')
@section('contents')
<div class='wrapper'>
@endif
    <h1>
        @lang('legal.privacy.title')
    </h1>
    <p class='text-warning lead'>
        <b>NOTE: </b> @lang('legal.translation_notes.p1') <a href='/legal/english'>@lang('legal.translation_notes.p2')</a>
    </p>
    <p>
        @lang('legal.privacy.effective')
    </p>
@for($i = 1; $i <= 25; $i++)
    @if(substr(trans('legal.privacy.p' . $i), 0, 7) === "HEADER:")
    <h2 class='text-info'>
        {!! str_replace("HEADER:", "", trans('legal.privacy.p' . $i)) !!}
    </h2>
    @else
    <p>
        @lang('legal.privacy.p' . $i)
    </p>
    @endif
@endfor
@if(!isset($include))
</div>
@stop
@endif
