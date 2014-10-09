<?php
use App\Runis\Accounts\User;
$user=User::find($member->user_id);
?>
						<div class='flip-container center-block' ontouchstart="this.classList.toggle('hover');">
							<div class='flipper'>
								<div class='front' style="background-image:url('/img/forum/photos/{{$user->id}}.png');">
								</div>
								<div class='back'>
									<a href='/forums/members/{{\String::slugEncode($user->id,$user->display_name)}}' title="Visit {{$user->display_name}}'s profile">
										<div class='back-logo center-block'>
											<img src='/img/forum/photos/{{$user->id}}.png' class='img-rounded center-block' />
										</div>
										<h3 class='center-block text-center'>
											{!!\String::color($user->display_name,$user->importantRole()->id)!!} 
										</h3>
									</a>
									<p class='text-center'>
										{!!$user->title!!} 
										<br />
@if(\Auth::check())
										<a href='/forums/messenger/compose/to={{\String::slugEncode($user->id,$user->display_name)}}' class='holo-text-secondary' title='Message {{$user->display_name}}'>
											<i class='fa fa-inbox'></i> Message
										</a>
@endif
									</p>
								</div>
							</div>
						</div>
						<br />