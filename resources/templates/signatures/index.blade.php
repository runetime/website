@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<form action='' method='post' class='form-horizontal' role='form'>
					<div class='form-group'>
						<label for='username' class='col-lg-2 control-label'>
							@lang('signature.name.question1')
						</label>
						<div class='col-lg-10'>
							<input type='text' id='username' name='username' class='form-control' placeholder="{{Lang::get('signature.name.question1')}}" required />
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit'>
								@lang('signature.name.continue')
							</button>
						</div>
					</div>
				</form>
				<p class='text-warning'>
					@lang('signature.name.note')
				</p>
			</div>
@stop