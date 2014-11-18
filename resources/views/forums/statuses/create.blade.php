@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<form class='form-horizontal' method='post' action='' role='form'>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='contents'>
							Status
						</label>
						<div class='col-lg-10'>
							<textarea name='contents' class='form-control' rows='5'></textarea>
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit'>
								Create
							</button>
						</div>
					</div>
				</form>
			</div>
@stop