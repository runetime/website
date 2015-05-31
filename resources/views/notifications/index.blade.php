@extends('layouts.default')
@section('contents')
<div class='wrapper'>
    <h1>
        @lang('notifications.title')
    </h1>
    <h3>
        @lang('notifications.unread')
    </h3>
@if(count($notificationsUnread) > 0)
    <a href='/notifications/set-all-read'>
        @lang('notifications.set_all_read')
    </a>
    @foreach($notificationsUnread as $notification)
        @include('notifications.card', ['notification' => $notification, 'status' => 'bad'])
    @endforeach
@else
    <p class='text-info'>
        <em>
            @lang('notifications.unread_none')
        </em>
    </p>
@endif
    <h3>
        @lang('notifications.read')
    </h3>
@if(count($notificationsRead) > 0)
    @foreach($notificationsRead as $notification)
        @include('notifications.card', ['notification' => $notification, 'status' => 'good'])
    @endforeach
@else
    <p class='text-info'>
        <em>
            @lang('notifications.read_none')
        </em>
    </p>
@endif
</div>
<script>
    $(function() {
        RuneTime.Notifications = new RuneTime.Notifications();
        RuneTime.Notifications.setup();
    });
</script>
@stop
