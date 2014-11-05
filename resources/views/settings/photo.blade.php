@extends('layouts.settings')
@section('settings')
						<h3>
							@lang('settings.photo.current')
						</h3>
						<div class='well well-sm'>
							{!!\Image::userPhoto(\Auth::user()->id)!!}
						</div>
						<h3>
							@lang('settings.photo.change')
						</h3>
						<form action='' class='form-horizontal' method='post' role='form'>
							<div class='form-group'>
								<div class='col-lg-10'>
									<textarea name='contents'></textarea>
								</div>
							</div>
						</form>
@stop