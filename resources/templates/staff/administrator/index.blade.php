@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Administrator Panel
				</h1>
				<div class='blocks clearfix'>
					<div>
						<a href='/staff/administrator/users'>
							Manage Users
						</a>
					</div>
					<div>
						<a rt-hook='admin.panel:radio.stop.open'>
							Stop Radio
						</a>
					</div>
					<div>
						<a rt-hook='admin.panel:staff.demote.open'>
							Demote All Staff
						</a>
					</div>
					<div>
						<a rt-hook='admin.panel:chatbox.clear.open'>
							Clear Chatbox
						</a>
					</div>
					<div>
						<a rt-hook='admin.panel:ip.ban.open'>
							IP Ban
						</a>
					</div>
				</div>
			</div>
			@include('staff.administrator.modals.radio_stop', ['id' => 'radio-stop'])
			@include('staff.administrator.modals.chatbox_clear')
			@include('staff.administrator.modals.staff_demote', ['id' => 'staff-demote'])
			@include('staff.administrator.modals.ip_ban', ['id' => 'ip-ban'])
			@include('partials.modals.good')
			@include('partials.modals.bad')
			<script>
				adminPanel = new AdminPanel();
			</script>
@stop