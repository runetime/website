@extends('layouts.default')
@section('contents')
<div class='wrapper'>
    <h1>
        Radio Live Center
    </h1>
    <div class='row row-flat text-center'>
        <div class='col-xs-12 col-sm-4'>
            <h3 class='holo-text'>
                @lang('staff.radio.live.current_song')
            </h3>
            <p rt-data='radio.panel:current.song'>
                <span class='holo-text-secondary' rt-data='radio.panel:current.song.name'>@lang('radio.na')</span> by <span class='holo-text-secondary' rt-data='radio.panel:current.song.artist'>@lang('radio.na')</span>
            </p>
        </div>
        <div class='col-xs-12 col-sm-4'>
            <h3 class='holo-text'>
                @lang('staff.radio.live.current_message')
            </h3>
            <p rt-data='radio.panel:current.message'></p>
            <h3 class='holo-text'>
                @lang('staff.radio.live.messages')
            </h3>
@foreach($messages as $message)
            <p>
                <a rt-data='radio.panel:message.update' rt-data2='{{ $message->id }}'>{!! $message->contents_parsed !!}</a>
            </p>
@endforeach
        </div>
        <div class='col-xs-12 col-sm-4'>
            <h3 class='holo-text'>
                @lang('staff.radio.live.requests')
            </h3>
            <div rt-data='radio.panel:requests'>
            </div>
        </div>
    </div>
</div>
<script>
    $(function() {
        radioPanel.live = new RadioPanelLive();
    });
</script>
@stop
