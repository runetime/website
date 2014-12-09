@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<div class='row'>
					<div class='col-xs-6'>
						<h3>
							Staff Checkup
						</h3>
						<p>
							<a href='/staff/checkup'>
								Complete your staff checkup once every Sunday!
							</a>
						</p>
					</div>
					<div class='col-xs-6'>
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
									<label class='col-lg-2 control-label' for='name'>
										User Name
									</label>
									<div class='col-lg-10'>
										<input id='name' class='form-control' type='text' name='name' placeholder='User Name Here' required />
									</div>
								</div>
								<div class='form-group'>
									<label class='col-lg-2 control-label' for='contents'>
										Reason
									</label>
									<div class='col-lg-10'>
										<textarea id='contents' name='contents' rows='5' class='width-full'></textarea>
									</div>
								</div>
							</form>
						</div>
						<div class='modal-footer'>
							<button type='button' class='btn btn-default' data-dismiss='modal'>
								Close
							</button>
							<button type='button' class='btn btn-primary'>
								Send Report
							</button>
						</div>
					</div>
				</div>
			</div>
@stop