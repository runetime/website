			<div class='wrapper'>
				{{Form::open(['class'=>'form-horizontal','role'=>'form'])}} 
					<div class='form-group'>
						{{Form::label('username',Lang::get('signature.name.question1'),['class'=>'col-lg-2 control-label'])}} 
						<div class='col-lg-10'>
							{{Form::text('username','',['class'=>'form-control','required','placeholder'=>Lang::get('signature.name.question1')])}} 
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit'>
								@lang('signature.name.continue')
							</button>
						</div>
					</div>
				{{Form::close()}} 
			</div>