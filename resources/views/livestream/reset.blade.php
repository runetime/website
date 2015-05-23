@extends('layouts.default')
@section('contents')
            <div class='wrapper'>
                <h1>
                    @lang('livestream.reset.title')
                </h1>
            </div>
            <h3 class='text-info text-center'>
                @lang('livestream.reset.resetting')
            </h3>
            <p class='text-center'>
                @lang('utilities.status'): <span class='text-muted' rt-hook='livestream.reset:status'>@lang('livestream.reset.checking')</span>
            </p>
            <p class='text-center' rt-hook='livestream.reset:spinner'>
                <i class='fa fa-spinner fa-spin fa-3x text-info'></i>
            </p>
            <p rt-hook='livestream.reset:note'></p>
            <script>
                livestreamReset = new LivestreamReset();
                livestreamReset.statuses('@lang('livestream.reset.checking')', '@lang('utilities.online')', '@lang('utilities.offline')', '@lang('livestream.reset.unknown')');
            </script>
@stop
