@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					@lang('staff.team_leader.title')
				</h1>
				<div class='pretty-row'>
					<div class='col-xs-6'>
						<div>
							<h3>
								Demote Member
							</h3>
							<p>
								Demote a staff member in your team.
							</p>
							<button type='button' class='btn btn-primary' data-toggle='modal' data-target='#modal-demote-member'>
								Demote Member
							</button>
						</div>
					</div>
					<div class='col-xs-6'>
						<div>
							<h3>
								Mute User
							</h3>
							<p>
								Mute a user on the chatbox for a set amount of time or permanently.
							</p>
							<button type='button' class='btn btn-primary' data-toggle='modal' data-target='#modal-mute-user'>
								Mute User
							</button>
						</div>
					</div>
					<div class='col-xs-6'>
						<div>
							<h3>
								Temporarily Ban
							</h3>
							<p>
								Temporarily ban a user for three days.
							</p>
							<button type='button' class='btn btn-primary' data-toggle='modal' data-target='#modal-temp-ban-user'>
								Ban User
							</button>
						</div>
					</div>
					<div class='col-xs-6'>
						<div>
							<h3>
								Clear Chatbox
							</h3>
							<p>
								Clear the chatbox of all messages.
							</p>
							<button type='button' class='btn btn-primary' data-toggle='modal' data-target='#modal-clear-chatbox'>
								Clear Chatbox
							</button>
						</div>
					</div>
				</div>
			</div>
			<script>
				leaderPanel = new LeaderPanel();
			</script>
			@include('staff.team_leader.modals.clear_chatbox')
			@include('staff.team_leader.modals.demote_member')
			@include('staff.team_leader.modals.mute_user')
			@include('staff.team_leader.modals.temp_ban_user')
			@include('partials.modals.good')
			@include('partials.modals.bad')
@stop