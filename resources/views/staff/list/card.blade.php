						<div class='flip-container center-block' rt-hook='hook!staff.list:card' rt-data='{{ $member->id }}'>
							<div class='flipper'>
								<div class='front'>
								</div>
								<div class='back'>
									<a href='/profile/{{ \String::slugEncode($member->id, $member->display_name) }}' title="Visit {{ $member->display_name }}'s profile">
										<div class='back-logo center-block'>
											<img src='/img/forums/photos/{{ $member->id }}.png' class='img-rounded center-block img-resposive' />
										</div>
										<h3 class='center-block text-center'>
											{!! \String::color($member->display_name, $member->importantRole()->id)!!}
										</h3>
									</a>
									<p class='text-center'>
										{!! $member->title !!}
										<br />
@if(\Auth::check())
										<a href='/messenger/compose/to={{ \String::slugEncode($member->id, $member->display_name) }}' class='holo-text-secondary' title='@lang('messenger.message')'>
											<i class='fa fa-inbox'></i> @lang('messenger.message')
										</a>
@endif
									</p>
								</div>
							</div>
						</div>
						<br />