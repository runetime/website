@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<div class='pretty-row'>
					<div class='col-xs-6'>
						<div>
							<h3>
								Staff Checkup
							</h3>
							<p>
								<a href='/staff/checkup'>
									Complete your staff checkup once every Sunday!
								</a>
							</p>
						</div>
					</div>
					<div class='col-xs-6'>
						<div>
							<h3>
								Report User
							</h3>
							<p>
								Report a user straight to the admins.
							</p>
							<button type='button' class='btn btn-primary' data-toggle='modal' data-target='#modal-report-user'>
								Report User
							</button>
						</div>
					</div>
					<div class='col-xs-6'>
						<div>
							<h3>
								Mute User
							</h3>
							<p>
								Temporarily mute a user on the chatbox for one hour.
							</p>
							<button type='button' class='btn btn-primary' data-toggle='modal' data-target='#modal-mute-user'>
								Mute User
							</button>
						</div>
					</div>
				</div>
			</div>
			<div class='modal fade' id='modal-report-user' tabindex='-1' role='dialog' aria-labelledby='modal-report-user' area-hidden='true'>
				<div class='modal-dialog'>
					<div class='modal-content'>
						<div class='modal-header'>
							<button type='button' class='close' data-dismiss='modal'>
								<span aria-hidden='true'>&times;</span> <span class='sr-only'>Close</span>
							</button>
							<h4 class='modal-title' id='modal-report-user'>
								Report User
							</h4>
						</div>
						<div class='modal-body'>
							<form class='form-horizontal' method='post' action='' role='form'>
								<div class='form-group'>
									<label class='col-lg-2 control-label' for='report-username'>
										User Name
									</label>
									<div class='col-lg-10'>
										<input id='report-username' class='form-control' type='text' name='report-username' placeholder='User Name Here' required />
									</div>
								</div>
								<div class='form-group'>
									<label class='col-lg-2 control-label' for='report-contents'>
										Reason
									</label>
									<div class='col-lg-10'>
										<textarea id='report-contents' name='report-contents' rows='5' class='width-full'></textarea>
									</div>
								</div>
							</form>
						</div>
						<div class='modal-footer'>
							<button type='button' class='btn btn-default' data-dismiss='modal'>
								Close
							</button>
							<button type='button' class='btn btn-primary' rt-hook='staff.panel:report.send'>
								Send Report
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
							<form class='form-horizontal' method='post' action='' role='form'>
								<div class='form-group'>
									<label class='col-lg-2 control-label' for='mute-username'>
										User Name
									</label>
									<div class='col-lg-10'>
										<input id='mute-username' class='form-control' type='text' name='mute-username' placeholder='User Name Here' required />
									</div>
								</div>
								<div class='form-group'>
									<label class='col-lg-2 control-label' for='mute-contents'>
										Reason
									</label>
									<div class='col-lg-10'>
										<textarea id='mute-contents' name='mute-contents' rows='5' class='width-full'></textarea>
									</div>
								</div>
							</form>
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
							<p class='text-success' rt-hook='staff.panel:results.good.message'>
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
								Request Sent
							</h4>
						</div>
						<div class='modal-body'>
							<p class='text-warning' rt-hook='staff.panel:results.bad.message'>
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
				staffPanel = new StaffPanel();
			</script>
@stop