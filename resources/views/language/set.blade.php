@extends('layouts.default')
@section('contents')
            <div class='wrapper'>
                <h1>
                    @lang('language.set.title')
                </h1>
                <h3>
                    @lang('language.set.available')
                </h3>
@foreach($langs['done'] as $initial => $lang)
    @include('language._show', ['initial' => $initial, 'language' => $lang, 'done' => true])
@endforeach
                <h3>
                    @lang('language.set.wip')
                </h3>
@foreach($langs['wip'] as $initial => $lang)
    @include('language._show', ['initial' => $initial, 'language' => $lang])
@endforeach
            </div>
@stop
