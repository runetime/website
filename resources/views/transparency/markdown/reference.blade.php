@extends('layouts.default')
@section('contents')
            <div class='wrapper'>
                <h1>
                    @lang('transparency.markdown.reference.title')
                </h1>
                <p class='text-primary'>
                    @lang('transparency.markdown.reference.note')
                </p>
                <h3>
                    @lang('transparency.markdown.table_of_contents')
                </h3>
                <ul>
@foreach($files as $name => $markdown)
                    <li>
                        <a onclick="$('html, body').animate({scrollTop: $('#markdown-set-{{ str_replace(" ", "-", $name) }}').offset().top-50}, 1000);">
                            {{ $name }}
                        </a>
                    </li>
@endforeach
                </ul>
@foreach($files as $name => $markdown)
                <div id='markdown-set-{{ str_replace(" ", "-", $name) }}' class='well'>
                    <h3 class='text-center'>
                        {{ $name }}
                    </h3>
                    <div class='row'>
                        <div class='col-xs-12 col-sm-6'>
                            <h4 class='text-center'>
                                @lang('transparency.markdown.title')
                            </h4>
<pre>{{ $markdown }}</pre>
                        </div>
                        <div class='col-xs-12 col-sm-6'>
                            <h4 class='text-center'>
                                @lang('transparency.markdown.rendered')
                            </h4>
                            <div>
                                {!! $renderedFiles[$name] !!}
                            </div>
                        </div>
                    </div>
                </div>
@endforeach
            </div>
@stop
