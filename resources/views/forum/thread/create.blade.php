@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					@lang('forum.thread.create.name',['subforum'=>$subforum->name])
				</h1>
				<form action='' class='form-horizontal' method='post' role='form'>
					<input type='hidden' name='subforum' value='{{$subforum->id}}' />
					<div class='form-group'>
						<label class='col-md-2 control-label' for='title'>
							@lang('forum.thread.create.title.name')
						</label>
						<div class='col-lg-10'>
							<input id='title' name='title' class='form-control' type='text' required />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-md-2 control-label' for='tags'>
							@lang('forum.thread.create.tags.name')
						</label>
						<div class='col-lg-10'>
							<input id='tags' name='tags' class='form-control' type='text' placeholder='{{Lang::get("forum.thread.create.tags.placeholder")}}' />
							<span class='help-block'>
								@lang('forum.thread.create.tags.help')
							</span>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-md-2 control-label' for='contents'>
							@lang('forum.thread.create.post.name')
						</label>
						<div class='col-lg-10'>
							<textarea class='form-control' id='contents' name='contents' rows='10' required></textarea>
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit'>
								@lang('forum.thread.create.submit.name')
							</button>
						</div>
					</div>
				</form>
			</div>
@stop