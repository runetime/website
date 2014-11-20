@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<form class='form-horizontal' method='post' action='' role='form' enctype='multipart/form-data'>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='name'>
							Name
						</label>
						<div class='col-lg-10'>
							<input id='name' class='form-control' type='text' name='name' placeholder='Name' required />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='image'>
							Image
						</label>
						<div class='col-lg-10'>
							<input id='image' class='form-control' type='file' name='image' />
							<span class='help-block'>
								Images are not currently resized, so you'll need to resize them yourself before uploading.
							</span>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='contents'>
							Contents
						</label>
						<div class='col-lg-10'>
							<textarea id='contents' name='contents' class='form-control' rows='10' required></textarea>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='tags'>
							Tags
						</label>
						<div class='col-lg-10'>
							<input id='tags' class='form-control' type='text' name='tags' placeholder='runetime, event' />
							<span class='help-block'>
								Separate all tags by a comma.
							</span>
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit'>
								Create Newspiece
							</button>
						</div>
					</div>
				</form>
			</div>
@stop