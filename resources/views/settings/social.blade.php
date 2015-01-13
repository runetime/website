@extends('layouts.settings')
@section('settings')
			<h3>
				@lang('settings.social.edit')
			</h3>
			<form action='' class='form-horizontal' method='post' role='form'>
				<div class='form-group'>
					<label class='col-lg-2 control-label' for='twitter'>
						Twitter
					</label>
					<div class='col-lg-10'>
						<input type='text' id='twitter' name='twitter' value='{{ \Auth::user()->social_twitter }}' />
					</div>
				</div>
				<div class='form-group'>
					<label class='col-lg-2 control-label' for='facebook'>
						Facebook
					</label>
					<div class='col-lg-10'>
						<input type='text' id='facebook' name='facebook' value='{{ \Auth::user()->social_facebook }}' />
					</div>
				</div>
				<div class='form-group'>
					<label class='col-lg-2 control-label' for='youtube'>
						YouTube
					</label>
					<div class='col-lg-10'>
						<input type='text' id='youtube' name='youtube' value='{{ \Auth::user()->social_youtube }}' />
					</div>
				</div>
				<div class='form-group'>
					<label class='col-lg-2 control-label' for='website'>
						Website
					</label>
					<div class='col-lg-10'>
						<input type='text' id='website' name='website' value='{{ \Auth::user()->social_website }}' />
					</div>
				</div>
				<div class='form-group'>
					<label class='col-lg-2 control-label' for='skype'>
						Skype
					</label>
					<div class='col-lg-10'>
						<input type='text' id='skype' name='skype' value='{{ \Auth::user()->social_skype }}' />
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