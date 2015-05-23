@extends('layouts.default')
@section('contents')
<div class='wrapper'>
    <h1>
        @lang('legal.title')
    </h1>
    <h3 class='text-info'>
        @lang('legal.view_privacy')
    </h3>
    <details>
        <summary>
            @lang('legal.view_privacy')
        </summary>
        <p>
@include('legal.privacy', ['include' => true])
        </p>
    </details>
    <h3 class='text-info'>
        @lang('legal.view_terms')
    </h3>
    <details>
        <summary>
            @lang('legal.view_terms')
        </summary>
        <p>
@include('legal.terms', ['include' => true])
        </p>
    </details>
</div>
@stop
