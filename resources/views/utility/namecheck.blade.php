@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Name Checker
				</h1>
				<form class='form-horizontal' role='form'>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='rsn-check-field'>
							Enter RuneScape Name
						</label>
						<div class='col-lg-10'>
							<input type='text' id='rsn-check-field' placeholder='Runescape Name' />
							<p id='rsn-availability'></p>
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-10 col-lg-offset-2'>
							<button type='button' class='btn btn-info' onclick='RuneTime.NameChecker.check();'>
								Check for Availability
							</button>
						</div>
					</div>
				</form>
				<script>
					RuneTime.NameChecker = new RuneTime.NameChecker();
				</script>
			</div>
@stop