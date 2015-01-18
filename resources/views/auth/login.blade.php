@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
@if($incorrect == true)
				<p class='text-warning'>
					@lang('auth.login.incorrect')
				</p>
@endif
				<form class='form-horizontal' method='post' action='' role='form'>
					<div id='signup-username' class='form-group has-feedback'>
						<label class='col-lg-2 control-label' for='email'>
							@lang('auth.login.email_address')
						</label>
						<div class='col-lg-10'>
							<input id='email' class='form-control' type='text' name='email' placeholder='john@example.com' required />
							<i class='glyphicon glyphicon-ok form-control-feedback hidden'></i>
							<i class='glyphicon glyphicon-remove form-control-feedback hidden'></i>
						</div>
					</div>
					<div id='signup-password' class='form-group has-feedback'>
						<label class='col-lg-2 control-label' for='password'>
							@lang('auth.login.password')
						</label>
						<div class='col-lg-10'>
							<input id='password' class='form-control' type='password' name='password' required />
							<i class='glyphicon glyphicon-ok form-control-feedback hidden'></i>
							<i class='glyphicon glyphicon-remove form-control-feedback hidden'></i>
							<span class='help-block'>
								<a href='/password/reset' class='text-muted'>@lang('auth.login.forgot')</a>
							</span>
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit'>
								@lang('auth.login.login')
							</button>
						</div>
					</div>
				</form>
			</div>
@stop