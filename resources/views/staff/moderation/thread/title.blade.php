@extends('.........layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Editing Title of Thread {{$thread->title}}
				</h1>
				<form action='' method='post' class='form-horizontal' role='form'>
					<input type='hidden' name='id' value='{{$thread->id}}' />
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='title'>
							New Title
						</label>
						<div class='col-lg-10'>
							<input type='text' class='form-control' name='title' id='title' value='{{$thread->title}}' required />
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit'>
								Submit
							</button>
						</div>
					</div>
				</form>
			</div>
@stop