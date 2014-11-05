@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<form class='form-horizontal' method='post' action='' role='form'>
					<div id='signup-display_name' class='form-group has-feedback'>
						<label class='col-lg-2 control-label' for='display_name'>
							@lang('signup.display_name')
						</label>
						<div class='col-lg-10'>
							<input id='display_name' class='form-control' type='text' name='display_name' placeholder='@lang('signup.display_name')' required='' />
							<i class='glyphicon glyphicon-ok form-control-feedback hidden'></i>
							<i class='glyphicon glyphicon-remove form-control-feedback hidden'></i>
							<span class='help-block hidden text-danger'>
								@lang('signup.error.display_name')
							</span>
						</div>
					</div>
					<div id='signup-email' class='form-group has-feedback'>
						<label class='col-lg-2 control-label' for='email'>
							@lang('signup.email_address')
						</label>
						<div class='col-lg-10'>
							<input id='email' class='form-control' type='email' name='email' placeholder='@lang('signup.email_address')' required='' />
							<i class='glyphicon glyphicon-ok form-control-feedback hidden'></i>
							<i class='glyphicon glyphicon-remove form-control-feedback hidden'></i>
							<span class='help-block hidden text-danger'>
								@lang('signup.error.email')
							</span>
						</div>
					</div>
					<div id='signup-password' class='form-group has-feedback'>
						<label class='col-lg-2 control-label' for='password'>
							@lang('signup.password')
						</label>
						<div class='col-lg-10'>
							<input id='password' class='form-control' type='password' name='password' placeholder='@lang('signup.password')' required='' />
							<i class='glyphicon glyphicon-ok form-control-feedback hidden'></i>
							<i class='glyphicon glyphicon-remove form-control-feedback hidden'></i>
						</div>
					</div>
					<div id='signup-password2' class='form-group has-feedback'>
						<label class='col-lg-2 control-label' for='message'>
							@lang('signup.confirm_password')
						</label>
						<div class='col-lg-10'>
							<input id='password2' class='form-control' type='password' name='password2' placeholder='@lang('signup.confirm_password')' required='' />
							<i class='glyphicon glyphicon-ok form-control-feedback hidden'></i>
							<i class='glyphicon glyphicon-remove form-control-feedback hidden'></i>
							<span class='help-block hidden text-danger'>
								@lang('signup.error.password')
							</span>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='security'>
				@lang('signup.security_check')
						</label>
						<div class='col-lg-10'>
							<input id='security' type='range' min='0' max='100' step='.1' value='50' />
							<p class='help-block'>
								@lang('signup.security_help')
							</p>
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit' disabled>
								@lang('signup.submit')
							</button>
							<p class='text-danger'>
								@lang('signup.error.submit')
							</p>
						</div>
					</div>
				</form>
			</div>
@stop