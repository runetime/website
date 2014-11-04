@extends('......layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Staff Checkup
				</h1>
				<form class='form-horizontal' method='post' action='' role='form'>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='username'>
							Username
						</label>
						<div class='col-lg-10'>
							<input id='username' name='username' class='form-control' placeholder='{{\Auth::user()->display_name}}' required readonly />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='date'>
							Date
						</label>
						<div class='col-lg-10'>
							<input id='date' name='date' class='form-control' placeholder='{{$date}}' required readonly />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='active'>
							Active
						</label>
						<div class='col-lg-10'>
							<div class='radio'>
								<label>
									<input type='radio' name='active' id='active-yes' value='1' checked />
									Yes
								</label>
							</div>
							<div class='radio'>
								<label>
									<input type='radio' name='active' id='active-no' value='0' />
									No
								</label>
							</div>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='date'>
							Hours Active
						</label>
						<div class='col-lg-10'>
							<textarea name='hours_active' class='form-control' rows='5'></textarea>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='date'>
							Team
						</label>
						<div class='col-lg-10'>
							<div class='radio'>
								<label>
									<input type='radio' name='team' id='team-content' value='content' checked />
									Content
								</label>
							</div>
							<div class='radio'>
								<label>
									<input type='radio' name='team' id='team-development' value='development' />
									Development
								</label>
							</div>
							<div class='radio'>
								<label>
									<input type='radio' name='team' id='team-community' value='community' />
									Community
								</label>
							</div>
							<div class='radio'>
								<label>
									<input type='radio' name='team' id='team-radio' value='radio' />
									Radio
								</label>
							</div>
							<div class='radio'>
								<label>
									<input type='radio' name='team' id='team-graphics' value='graphics' />
									Graphics
								</label>
							</div>
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