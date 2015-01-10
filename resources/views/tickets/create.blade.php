@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					@lang('tickets.create.title')
				</h1>
				<form class='form-horizontal' method='post' action='' role='form'>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='name'>
							@lang('fields.subject')
						</label>
						<div class='col-lg-10'>
							<input type='text' id='name' name='name' class='form-control' required />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='contents'>
							@lang('tickets.create.ticket_message')
						</label>
						<div class='col-lg-10'>
							<textarea id='contents' name='contents' class='form-control' rows='15'></textarea>
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