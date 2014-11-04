@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Password Reset
				</h1>
				<p>
					An email will be sent to your account with a password reset link.
				</p>
				<form class='form-horizontal' method='post' action='' role='form'>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='email'>
							@lang('login.email_address')
						</label>
						<div class='col-lg-10'>
							<input id='email' class='form-control' type='text' name='email' placeholder='john@example.com' required />
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit'>
								Submit
							</button>
						</div>
					</div>
				</form>
			</div>
@stop