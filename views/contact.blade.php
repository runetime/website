@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					@lang('contact.title')
				</h1>
				<p>
					@lang('contact.form.respond')
				</p>
				<form class='form-horizontal' role='form'>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='rsn-check-field'>
							@lang('fields.email_address')
						</label>
						<div class='col-lg-10'>
							<input id='contact-email' class='form-control' type='text' placeholder='joe@example.com' required />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='contact-message'>
							@lang('fields.message')
						</label>
						<div class='col-lg-10'>
							<textarea id='contact-message' rows='10' class='width-full'></textarea>
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-10 col-lg-offset-2'>
							<p id='contact-error'></p>
							<button type='button' class='btn btn-info' rt-hook='contact:submit'>
								@lang('contact.form.send')
							</button>
						</div>
					</div>
				</form>
			</div>
			<script>
				contact = new Contact();
			</script>
@stop