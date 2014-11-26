@extends('layouts.default')
@section('contents')
			<div class='wrapper wrapper-none-res'>
@if(\Auth::check() && \Auth::user()->isStaff())
				<ul class='list-inline pull-right'>
					<li>
						<a href='/livestream/reset' class='btn btn-sm btn-primary'>
							Recheck Status
						</a>
					</li>
				</ul>
@endif
@if($status)
				<div class='row row-flat'>
					<div class='col-xs-12 col-sm-8 col-md-9 padding-none'>
						<div class='embed-responsive embed-responsive-16by9'>
							<object class='embed-responsive-item' type='application/x-shockwave-flash' height='378' width='620' id='live_embed_player_flash' data='http://www.twitch.tv/widgets/live_embed_player.swf?channel=rune_time' bgcolor='#000000'>
								<param name='allowFullScreen' value='true' />
								<param name='allowScriptAccess' value='always' />
								<param name='allowNetworking' value='all' />
								<param name='movie' value='http://www.twitch.tv/widgets/live_embed_player.swf' />
								<param name='flashvars' value='hostname=www.twitch.tv&channel=rune_time&auto_play=true&start_volume=25' />
							</object>
						</div>
					</div>
					<div class='col-xs-12 col-sm-4 col-md-3 padding-none'>
						<div id='chatbox-holder' class='col-xs-12'>
	@include('partials.chat')
						</div>
					</div>
				</div>
				<script>
					$(function() {
						var chatbox = $('#chatbox').height(),
							messages = $('#chatbox-messages').height(),
							chatFluff = chatbox - messages,
							stream = $('#live_embed_player_flash').height(),
							newMessages = stream - chatFluff;
						$('#chatbox-messages').height(newMessages);
					});
				</script>
@else
				<h2 class='text-danger text-center'>
					RuneTime is currently not streaming
				</h2>
				<div id='chatbox-holder' class='col-xs-12'>
@include('partials.chat')
				</div>
@endif
			</div>
			<script>
                $(function() {
                    chatbox = new Chatbox('livestream');
                });
			</script>
@stop