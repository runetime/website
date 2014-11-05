@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					@lang('forums.thread.create.name',['subforum' => $subforum->name])
				</h1>
				<form action='' class='form-horizontal' method='post' role='form'>
					<input type='hidden' name='subforum' value='{{$subforum->id}}' />
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='title'>
							@lang('forums.thread.create.title.name')
						</label>
						<div class='col-lg-10'>
							<input id='title' name='title' class='form-control' type='text' required />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='tags'>
							@lang('forums.thread.create.tags.name')
						</label>
						<div class='col-lg-10'>
							<input id='tags' name='tags' class='form-control' type='text' placeholder='@lang("forums.thread.create.tags.placeholder")' />
							<span class='help-block'>
								@lang('forums.thread.create.tags.help')
							</span>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='tags'>
							@lang('forums.thread.create.poll.name')
						</label>
						<div class='col-lg-10'>
@include('_poll')
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='contents'>
							@lang('forums.thread.create.post.name')
						</label>
						<div class='col-lg-10'>
							<textarea class='form-control' id='contents' name='contents' rows='10' required></textarea>
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit'>
								@lang('forums.thread.create.submit.name')
							</button>
						</div>
					</div>
				</form>
			</div>
@stop