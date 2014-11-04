@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
@if (Session::has('error'))
				<p class='text-warning'>
					{{ Session::get('error') }}
				</p>
@endif
				<form action='' method='post' class='form-horizontal' role='form'>
					<input type='hidden' name='token' value='{{$token}}' disabled required />
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='email'>
							Email Address
						</label>
						<div class='col-lg-10'>
							<input id='email' class='form-control' type='text' name='email' placeholder='john@example.com' required />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='password'>
							New Password
						</label>
						<div class='col-lg-10'>
							<input id='password' class='form-control' type='password' name='password' required />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='password_confirmation'>
							New Password Confirmation
						</label>
						<div class='col-lg-10'>
							<input id='password_confirmation' class='form-control' type='password' name='password_confirmation' required />
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit'>
								Reset Password
							</button>
						</div>
					</div>
				</form>
			</div>
@stop