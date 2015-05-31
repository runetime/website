@extends('layouts.default')
@section('contents')
<div class='wrapper'>
    <h1 class='text-center holo-text-secondary'>
        <a onclick='openRadio();'>
            @lang('radio.open.click_here')
        </a>
    </h1>
    <p class='text-warning text-center'>
        <b>@lang('utilities.note'):</b> @lang('radio.open.legal')
    </p>
</div>
<script>
    function openRadio() {
        window.open('http://apps.streamlicensing.com/player-popup.php?sid=2579&stream_id=4386', 'RuneTime Radio', 'width=405,height=375,scrollbars=no');
        window.location.href = '/radio';
    }
</script>
@stop
