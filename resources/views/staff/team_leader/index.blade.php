@extends('layouts.default')
@section('contents')
            <div class='wrapper'>
                <h1>
                    @lang('staff.team_leader.title')
                </h1>
                <div class='blocks clearfix'>
                    <div>
                        <a data-toggle='modal' data-target='#modal-demote-member'>
                            Demote Member
                        </a>
                    </div>
                    <div>
                        <a data-toggle='modal' data-target='#modal-mute-user'>
                            Mute User
                        </a>
                    </div>
                    <div>
                        <a data-toggle='modal' data-target='#modal-temp-ban-user'>
                            Temporarily Ban
                        </a>
                    </div>
                    <div>
                        <a data-toggle='modal' data-target='#modal-clear-chatbox'>
                            Clear Chatbox
                        </a>
                    </div>
                </div>
            </div>
            @include('staff.team_leader.modals.clear_chatbox')
            @include('staff.team_leader.modals.demote_member')
            @include('staff.team_leader.modals.mute_user')
            @include('staff.team_leader.modals.temp_ban_user')
            @include('partials.modals.good')
            @include('partials.modals.bad')
            <script>
                leaderPanel = new LeaderPanel();
            </script>
@stop
