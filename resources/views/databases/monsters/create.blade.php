@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Creating a Monster
				</h1>
				<p class='text-info'>
					All textareas on RuneTime, including the ones in this guide, use <a href='/transparency/markdown'>Markdown</a> for styling.
				</p>
				<form action='' method='post' class='form-horizontal' role='form'>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='name'>
							Name
						</label>
						<div class='col-lg-10'>
							<input id='name' class='form-control' type='text' name='name' required />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='examine'>
							Examine
						</label>
						<div class='col-lg-10'>
							<input id='examine' class='form-control' type='text' name='examine' required />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='stats'>
							Stats
						</label>
						<div class='col-lg-10'>
							<textarea name='stats' id='stats' class='form-control' rows='10' required></textarea>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='location'>
							Location
						</label>
						<div class='col-lg-10'>
							<textarea name='location' id='location' class='form-control' rows='10' required></textarea>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='drops'>
							Drops
						</label>
						<div class='col-lg-10'>
							<textarea name='drops' id='drops' class='form-control' rows='10' required></textarea>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='membership'>
							Membership?
						</label>
						<div class='col-lg-10'>
							<div class='radio'>
								<label>
									<input type='radio' name='membership' value='0' checked />
									Free
								</label>
							</div>
							<div class='radio'>
								<label>
									<input type='radio' name='membership' value='1' />
									Members
								</label>
							</div>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='other_information'>
							Other Information
						</label>
						<div class='col-lg-10'>
							<textarea name='other_information' id='other_information' class='form-control' rows='10' required></textarea>
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit'>
								Create Monster
							</button>
						</div>
					</div>
				</form>
			</div>
@stop