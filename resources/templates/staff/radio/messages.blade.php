@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					@lang('staff.radio.messages.title')
				</h1>
			</div>
			<div class='wrapper-dark'>
				<form class='form-horizontal' action='' method='post' role='form'>
					<div id='signup-' class='form-group'>
						<label class='col-lg-2 control-label' for='contents'>
							@lang('fields.message')
						</label>
						<div class='col-lg-10'>
							<input type='text' id='contents' class='form-control' name='contents' required />
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit'>
								@lang('staff.radio.messages.create')
							</button>
						</div>
					</div>
				</form>
			</div>
			<div class='wrapper'>
				<h3>
					@lang('staff.radio.messages.current')
				</h3>
@foreach($messages as $message)
				<div class='well well-sm'>
					<p>
						{!!$message->contents_parsed!!}
					</p>
				</div>
@endforeach
			</div>
@stop