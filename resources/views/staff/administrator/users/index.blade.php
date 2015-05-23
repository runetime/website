@extends('layouts.default')
@section('contents')
            <div class='wrapper-dark row row-margin text-center'>
                <div class='col-xs-12'>
                    <h3 class='holo-text'>
                        Search by Name
                    </h3>
                    <label for='admin-user-search' class='holo-text-secondary'>
                        Username
                    </label>
                    <input type='text' id='admin-user-search' placeholder='Username' class='center-block' />
                    <br />
                    <p>
                        <a rt-hook='admin.panel:user.search'>
                            Search
                        </a>
                    </p>
                    <br />
                    <p>
                        <a rt-hook='admin.panel:user.search.all'>
                            Search All Users
                        </a>
                    </p>
                </div>
            </div>
            <div class='wrapper'>
                <h3>
                    Results
                </h3>
                <div class='row' id='admin-user-list'>
                </div>
            </div>
            @include('staff.administrator.modals.user.award_add', ['id' => 'award-add'])
            @include('staff.administrator.modals.user.ban', ['id' => 'ban'])
            @include('staff.administrator.modals.user.chatbox_remove', ['id' => 'chatbox-remove'])
            @include('staff.administrator.modals.user.posts_remove', ['id' => 'posts-remove'])
            @include('staff.administrator.modals.ip_ban', ['id' => 'ip-ban'])
            @include('staff.team_leader.modals.mute_user', ['id' => 'mute'])
            @include('partials.modals.good')
            @include('partials.modals.bad')
            <script>
                userPanel = new AdminUserPanel();
            </script>
@stop
