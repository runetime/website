							<details>
								<summary>
									@lang('forums.thread.create.poll.summary')
								</summary>
								<p>
									<div class='form-horizontal'>
										<div class='form-group'>
											<label class='col-lg-2 control-label for='poll-title'>
												@lang('forums.thread.create.poll.title')
											</label>
											<div class='col-lg-10'>
												<input type='text' class='form-control' name='poll.title' id='poll-title' />
											</div>
										</div>
@foreach(range(1, 1) as $questionNumber)
										<div class='form-group'>
											<label class='col-lg-2 control-label for='poll-question-{{$questionNumber}}'>
												@lang('forums.thread.create.poll.question') {{$questionNumber}}
											</label>
											<div class='col-lg-10'>
												<input type='text' class='form-control' name='poll.question.{{$questionNumber}}' id='poll-question-{{$questionNumber}}' />
											</div>
										</div>
	@foreach(range(1, 5) as $answerNumber)
										<div class='form-group'>
											<label class='col-lg-2 control-label for='poll-question-{{$answerNumber}}'>
												@lang('forums.thread.create.poll.answer') {{$answerNumber}}
											</label>
											<div class='col-lg-10'>
												<input type='text' class='form-control' name='poll.question.{{$answerNumber}}' id='poll-question-{{$answerNumber}}' />
											</div>
										</div>
	@endforeach
@endforeach
									</div>
								</p>
							</details>