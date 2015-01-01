@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<form id='signature-form' class='simform' autocomplete='off'>
					<div class='simform-inner'>
						<ol class='questions'>
							<li>
								<span>
									<label for='q1'>
										@lang('signature.name.question1')
									</label>
								</span>
								<input id='q1' name='q1' type='text' />
							</li>
						</ol>
						<button class='submit' type='submit'>
							Send answers
						</button>
						<div class='controls'>
							<button class='next'></button>
							<div class='progress'></div>
							<span class='number'>
								<span class='number-current'></span>
								<span class='number-total'></span>
							</span>
							<span class='error-message'></span>
						</div>
					</div>
					<span class='final-message'></span>
				</form>
			</div>
	<script>
		signature = new Signature();
	</script>
@stop