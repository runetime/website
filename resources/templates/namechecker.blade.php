@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					@lang('namechecker.title')
				</h1>
				<form class='form-horizontal' role='form'>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='rsn-check-field'>
							@lang('namechecker.enter_rsn')
						</label>
						<div class='col-lg-10'>
							<input id='rsn-check-field' class='form-control' type='text' placeholder='@lang('namechecker.rsn')' required />
							<p id='rsn-availability'></p>
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-10 col-lg-offset-2'>
							<button type='button' class='btn btn-info' rt-hook='name.checker:submit'>
								@lang('namechecker.check')
							</button>
						</div>
					</div>
				</form>
			</div>
			<script>
				$(function() {
                	nameChecker = new NameChecker();
                });
			</script>
@stop