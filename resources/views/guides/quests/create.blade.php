@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Creating a Quest Guide
				</h1>
				<p class='text-info'>
					All textareas on RuneTime, including the ones in this guide, use <a href='/transparency/markdown'>Markdown</a> for styling.
				</p>
				<form action='' method='post' class='form-horizontal' role='form'>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='name'>
							Name of Quest
						</label>
						<div class='col-lg-10'>
							<input id='name' class='form-control' type='text' name='name' required />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='difficulty'>
							Difficulty
						</label>
						<div class='col-lg-10'>
							<div class='radio'>
								<label>
									<input type='radio' name='difficulty' value='1' checked />
									Novice
								</label>
							</div>
							<div class='radio'>
								<label>
									<input type='radio' name='difficulty' value='2' />
									Intermediate
								</label>
							</div>
							<div class='radio'>
								<label>
									<input type='radio' name='difficulty' value='3' />
									Experienced
								</label>
							</div>
							<div class='radio'>
								<label>
									<input type='radio' name='difficulty' value='4' />
									Master
								</label>
							</div>
							<div class='radio'>
								<label>
									<input type='radio' name='difficulty' value='5' />
									Grandmaster
								</label>
							</div>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='length'>
							Length
						</label>
						<div class='col-lg-10'>
							<div class='radio'>
								<label>
									<input type='radio' name='length' value='6' checked />
									Short
								</label>
							</div>
							<div class='radio'>
								<label>
									<input type='radio' name='length' value='7' />
									Medium
								</label>
							</div>
							<div class='radio'>
								<label>
									<input type='radio' name='length' value='8' />
									Long
								</label>
							</div>
							<div class='radio'>
								<label>
									<input type='radio' name='length' value='9' />
									Very Long
								</label>
							</div>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='membership'>
							Membership?
						</label>
						<div class='col-lg-10'>
							<div class='radio'>
								<label>
									<input type='radio' name='membership' value='10' checked />
									Free
								</label>
							</div>
							<div class='radio'>
								<label>
									<input type='radio' name='membership' value='11' />
									Members
								</label>
							</div>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='qp'>
							Quest Points
						</label>
						<div class='col-lg-10'>
							<input id='qp' class='form-control' type='text' name='qp' required />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='completed'>
							Completed
						</label>
						<div class='col-lg-10'>
							<div class='radio'>
								<label>
									<input type='radio' name='completed' value='1' checked />
									Yes
								</label>
							</div>
							<div class='radio'>
								<label>
									<input type='radio' name='completed' value='0' />
									No
								</label>
							</div>
							<p class='help-block'>
								Is this guide complete?
							</p>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='description'>
							Description
						</label>
						<div class='col-lg-10'>
							<textarea name='description' id='description' class='form-control' rows='10' required></textarea>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='quest_requirements'>
							Quest Requirements
						</label>
						<div class='col-lg-10'>
							<textarea name='quest_requirements' id='quest_requirements' class='form-control' rows='10' required></textarea>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='skill_requirements'>
							Skill Requirements
						</label>
						<div class='col-lg-10'>
							<textarea name='skill_requirements' id='skill_requirements' class='form-control' rows='10' required></textarea>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='items_required'>
							Items Required
						</label>
						<div class='col-lg-10'>
							<textarea name='items_required' id='items_required' class='form-control' rows='10' required></textarea>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='items_recommended'>
							Items Recommended
						</label>
						<div class='col-lg-10'>
							<textarea name='items_recommended' id='items_recommended' class='form-control' rows='10' required></textarea>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='reward'>
							Reward
						</label>
						<div class='col-lg-10'>
							<textarea name='reward' id='reward' class='form-control' rows='10' required></textarea>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='starting_point'>
							Starting Point
						</label>
						<div class='col-lg-10'>
							<textarea name='starting_point' id='starting_point' class='form-control' rows='10' required></textarea>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='guide'>
							Guide
						</label>
						<div class='col-lg-10'>
							<textarea name='guide' id='guide' class='form-control' rows='10' required></textarea>
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit'>
								Create Guide
							</button>
						</div>
					</div>
				</form>
			</div>
@stop