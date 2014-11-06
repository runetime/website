@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Creating a Quest Guide
				</h1>
				<p class='text-info'>
					All textareas on RuneTime, including the ones in this guide, use <a href='/transparency/markdown'>Markdown</a> for styling.
				</p>
				<form action='' method='post' class='form-horizontal' role='form'>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='name'>
							Name of Location
						</label>
						<div class='col-lg-10'>
							<input id='name' class='form-control' type='text' name='name' required />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='contents'>
							Location
						</label>
						<div class='col-lg-10'>
							<textarea name='contents' id='contents' class='form-control' rows='10' required></textarea>
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit'>
								Create Guide
							</button>
						</div>
					</div>
				</form>
			</div>
@stop