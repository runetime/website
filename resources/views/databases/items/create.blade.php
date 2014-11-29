@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					@lang('database.items.create.title')
				</h1>
				<p class='text-info'>
					@lang('database.create_note')
				</p>
				<form action='' method='post' class='form-horizontal' role='form'>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='name'>
							@lang('database.items.create.name')
						</label>
						<div class='col-lg-10'>
							<input id='name' class='form-control' type='text' name='name' required />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='examine'>
							@lang('database.items.create.examine')
						</label>
						<div class='col-lg-10'>
							<input id='examine' class='form-control' type='text' name='examine' required />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='description'>
							@lang('database.items.create.description')
						</label>
						<div class='col-lg-10'>
							<textarea name='description' id='description' class='form-control' rows='10' required></textarea>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='membership'>
							@lang('database.items.create.membership')
						</label>
						<div class='col-lg-10'>
							<div class='radio'>
								<label>
									<input type='radio' name='membership' value='0' checked />
									@lang('utilities.membership.free')
								</label>
							</div>
							<div class='radio'>
								<label>
									<input type='radio' name='membership' value='1' />
									@lang('utilities.membership.members')
								</label>
							</div>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='tradable'>
							@lang('database.items.create.tradable')
						</label>
						<div class='col-lg-10'>
							<div class='radio'>
								<label>
									<input type='radio' name='tradable' value='1' checked />
									@lang('utilities.yes')
								</label>
							</div>
							<div class='radio'>
								<label>
									<input type='radio' name='tradable' value='0' />
									@lang('utilities.no')
								</label>
							</div>
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='quest_item'>
							@lang('database.items.create.quest_item')
						</label>
						<div class='col-lg-10'>
							<div class='radio'>
								<label>
									<input type='radio' name='quest_item' value='1' checked />
									@lang('utilities.yes')
								</label>
							</div>
							<div class='radio'>
								<label>
									<input type='radio' name='quest_item' value='0' />
									@lang('utilities.no')
								</label>
							</div>
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit'>
								@lang('database.items.create.create_item')
							</button>
						</div>
					</div>
				</form>
			</div>
@stop