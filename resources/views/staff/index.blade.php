@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					@lang('staff.index.title')
				</h1>
				<div class='blocks clearfix'>
					<div>
						<a href='/staff/checkup'>
							Staff Checkup
						</a>
					</div>
					<div>
						<a data-toggle='modal' data-target='#modal-report-user'>
							Report User
						</a>
					</div>
					<div>
						<a data-toggle='modal' data-target='#modal-mute-user'>
							Mute User
						</a>
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
							<form class='form-horizontal' role='form'>
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
							<form class='form-horizontal' role='form'>
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
			@include('partials.modals.good')
			@include('partials.modals.bad')
			<script>
				staffPanel = new StaffPanel();
			</script>
@stop