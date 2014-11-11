@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Compose New Message
				</h1>
				<form action='' method='post' class='form-horizontal' role='form'>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='participants'>
							Participants
						</label>
						<div class='col-lg-10'>
							<input type='text' id='participants' name='participants' class='form-control' required {{!empty($to) ? "value=" . $to->display_name : ""}} />
							<span class='help-block'>
								Names are case-sensitive.  Separate names by commas.
							</span>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='title'>
							Subject
						</label>
						<div class='col-lg-10'>
							<input type='text' id='title' name='title' class='form-control' required />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='contents'>
							Message
						</label>
						<div class='col-lg-10'>
							<textarea class='form-control' id='contents' name='contents' rows='15' required></textarea>
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit'>
								Send
							</button>
						</div>
					</div>
				</form>
			</div>
@stop