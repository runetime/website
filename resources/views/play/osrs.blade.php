@extends('layouts.default')
@section('contents')
<div class='wrapper-flat'>
    <div class='row row-flat'>
        <div class='col-xs-12 col-sm-8 col-md-6 col-lg-8'>
            <div class='embed-responsive embed-responsive-4by3'>
                <iframe class='embed-responsive-item' src='http://oldschool82.runescape.com/j1' id='osrs-iframe'></iframe>
            </div>
        </div>
        <div class='col-xs-12 col-sm-4 col-md-6 col-lg-4'>
            <div id='chatbox-holder'>
                @include('partials._chat')
            </div>
        </div>
    </div>
</div>
<script>
    $(function() {
        var chatbox = $('#chatbox').height(),
                messages = $('#chatbox-messages').height(),
                chatFluff = chatbox - messages,
                game = $('#osrs-iframe').height(),
                newMessages = game - chatFluff;
        $('#chatbox-messages').height(newMessages);
    });
    $(function () {
        chatbox = new Chatbox('radio');
    });
</script>
@stop
