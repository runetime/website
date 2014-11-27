@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					@lang('auth.reset.title')
				</h1>
				<p>
					@lang('auth.reset.note')
				</p>
				<form class='form-horizontal' method='post' action='' role='form'>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='email'>
							@lang('auth.login.email_address')
						</label>
						<div class='col-lg-10'>
							<input id='email' class='form-control' type='text' name='email' placeholder='john@example.com' required />
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit'>
								@lang('utilities.submit')
							</button>
						</div>
					</div>
				</form>
			</div>
@stop