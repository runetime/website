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
			<div class='modal fade' id='modal-demote-member' tabindex='-1' role='dialog' aria-labelledby='modal-demote-member' area-hidden='true'>
				<div class='modal-dialog'>
					<div class='modal-content'>
						<div class='modal-header'>
							<button type='button' class='close' data-dismiss='modal'>
								<span aria-hidden='true'>&times;</span> <span class='sr-only'>Close</span>
							</button>
							<h4 class='modal-title' id='modal-demote-member'>
								Demote Member
							</h4>
						</div>
						<div class='modal-body'>
							<p class='text-warning'>
								Please note that once you click demote that member will be immediately demoted.
							</p>
							<ul class='list-unstyled'>
@foreach($members as $member)
								<li>
									{!! \Link::name($member->user->id) !!} <button type='button' class='btn btn-info' rt-hook='leader.panel:demote.data' rt-data='{{ $member->user->id }}'>Demote</button>
								</li>
@endforeach
							</ul>
						</div>
						<div class='modal-footer'>
							<button type='button' class='btn btn-default' data-dismiss='modal'>
								Close
							</button>
						</div>
					</div>
				</div>
			</div>
			<div class='modal fade' id='modal-mute-user' tabindex='-1' role='dialog' aria-labelledby='modal-mute-user' area-hidden='true'>
				<div class='modal-dialog'>
					<div class='modal-content'>
						<div class='modal-header'>
							<button type='button' class='close' data-dismiss='modal'>
								<span aria-hidden='true'>&times;</span> <span class='sr-only'>Close</span>
							</button>
							<h4 class='modal-title' id='modal-mute-user'>
								Mute User
							</h4>
						</div>
						<div class='modal-body'>
							stuff2
						</div>
						<div class='modal-footer'>
							<button type='button' class='btn btn-default' data-dismiss='modal'>
								Close
							</button>
							<button type='button' class='btn btn-primary' rt-hook='staff.panel:mute.send'>
								Mute User
							</button>
						</div>
					</div>
				</div>
			</div>
			<div class='modal fade' id='modal-temp-ban-user' tabindex='-1' role='dialog' aria-labelledby='modal-temp-ban-user' area-hidden='true'>
				<div class='modal-dialog'>
					<div class='modal-content'>
						<div class='modal-header'>
							<button type='button' class='close' data-dismiss='modal'>
								<span aria-hidden='true'>&times;</span> <span class='sr-only'>Close</span>
							</button>
							<h4 class='modal-title' id='modal-temp-ban-user'>
								Temporarily Ban User
							</h4>
						</div>
						<div class='modal-body'>
							Form3
						</div>
						<div class='modal-footer'>
							<button type='button' class='btn btn-default' data-dismiss='modal'>
								Close
							</button>
							<button type='button' class='btn btn-primary' rt-hook='staff.panel:mute.send'>
								Ban User
							</button>
						</div>
					</div>
				</div>
			</div>
			<div class='modal fade' id='modal-clear-chatbox' tabindex='-1' role='dialog' aria-labelledby='modal-clear-chatbox' area-hidden='true'>
				<div class='modal-dialog'>
					<div class='modal-content'>
						<div class='modal-header'>
							<button type='button' class='close' data-dismiss='modal'>
								<span aria-hidden='true'>&times;</span> <span class='sr-only'>Close</span>
							</button>
							<h4 class='modal-title' id='modal-clear-chatbox'>
								Clear Chatbox
							</h4>
						</div>
						<div class='modal-body'>
							<p>
								Are you sure you want to clear all of the messages in the chatbox?
							</p>
							<form class='form-horizontal' role='form'>
								<div class='form-group'>
									<label class='col-lg-2 control-label' for='chatbox-clear-reason'>
										Reason
									</label>
									<div class='col-lg-10'>
										<textarea id='chatbox-clear-reason' name='chatbox-clear-reason' rows='5' class='width-full' rt-hook='leader.panel:chatbox.reason'></textarea>
									</div>
								</div>
							</form>
						</div>
						<div class='modal-footer'>
							<button type='button' class='btn btn-default' data-dismiss='modal'>
								Close
							</button>
							<button type='button' class='btn btn-primary' rt-hook='leader.panel:chatbox.clear'>
								Clear Chatbox
							</button>
						</div>
					</div>
				</div>
			</div>
			<div class='modal fade' id='modal-results-good' tabindex='-1' role='dialog' aria-labelledby='modal-results-good' area-hidden='true'>
				<div class='modal-dialog'>
					<div class='modal-content'>
						<div class='modal-header'>
							<button type='button' class='close' data-dismiss='modal'>
								<span aria-hidden='true'>&times;</span> <span class='sr-only'>Close</span>
							</button>
							<h4 class='modal-title text-success' id='modal-results-good'>
								Request Sent
							</h4>
						</div>
						<div class='modal-body'>
							<p class='text-success' rt-hook='leader.panel:results.good.message'>
								Your request has been successfully sent.
							</p>
						</div>
						<div class='modal-footer'>
							<button type='button' class='btn btn-success' data-dismiss='modal'>
								Close
							</button>
						</div>
					</div>
				</div>
			</div>
			<div class='modal fade' id='modal-results-bad' tabindex='-1' role='dialog' aria-labelledby='modal-results-bad' area-hidden='true'>
				<div class='modal-dialog'>
					<div class='modal-content'>
						<div class='modal-header'>
							<button type='button' class='close' data-dismiss='modal'>
								<span aria-hidden='true'>&times;</span> <span class='sr-only'>Close</span>
							</button>
							<h4 class='modal-title text-warning' id='modal-results-bad'>
								Request Error
							</h4>
						</div>
						<div class='modal-body'>
							<p class='text-warning' rt-hook='leader.panel:results.bad.message'>
								There was an error processing your request.  Please try again.
							</p>
						</div>
						<div class='modal-footer'>
							<button type='button' class='btn btn-warning' data-dismiss='modal'>
								Close
							</button>
						</div>
					</div>
				</div>
			</div>
			<script>
				leaderPanel = new LeaderPanel();
			</script>
@stop