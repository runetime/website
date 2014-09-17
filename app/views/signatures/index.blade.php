			<div class='wrapper'>
				{{Form::open(['class'=>'form-horizontal','role'=>'form'])}} 
					<div class='form-group'>
						{{Form::label('username','Username',['class'=>'col-lg-2 control-label'])}} 
						<div class='col-lg-10'>
							{{Form::text('username','Runescape Name',['class'=>'form-control','required'])}} 
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit'>
								Choose a Type
							</button>
						</div>
					</div>
				{{Form::close()}} 
			</div>