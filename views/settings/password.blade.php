@extends('layouts.settings')
@section('settings')
						<h3>
							@lang('settings.password.note')
						</h3>
						<form action='' class='form-horizontal' method='post' role='form'>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='current'>
									@lang('settings.password.current')
								</label>
								<div class='col-lg-10'>
									<input type='password' id='current' name='current' />
								</div>
							</div>
							<div class='form-group'>
								<label class='col-lg-2 control-label' for='new'>
									@lang('settings.password.new')
								</label>
								<div class='col-lg-10'>
									<input type='password' id='new' name='new' />
								</div>
							</div>
							<div class='form-group'>
								<div class='col-lg-offset-2 col-lg-10'>
									<button class='btn btn-primary' type='submit'>
										Save
									</button>
								</div>
							</div>
						</form>
@stop