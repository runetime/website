@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<div class='row'>
@if($status)
					<div class='col-xs-12 col-sm-8 col-md-9 col-lg-9 embed-responsive embed-responsive-16by9'>
						<object class='embed-responsive-item' type='application/x-shockwave-flash' height='378' width='620' id='live_embed_player_flash' data='http://www.twitch.tv/widgets/live_embed_player.swf?channel=rune_time' bgcolor='#000000'>
							<param name='allowFullScreen' value='true' />
							<param name='allowScriptAccess' value='always' />
							<param name='allowNetworking' value='all' />
							<param name='movie' value='http://www.twitch.tv/widgets/live_embed_player.swf' />
							<param name='flashvars' value='hostname=www.twitch.tv&channel=rune_time&auto_play=true&start_volume=25' />
						</object>
					</div>
					<div class='col-xs-12 col-sm-4 col-md-3 col-lg-3'>
						<div id='chatbox-holder' class='col-xs-12 holo-box-dark'>
@include('...partials.chat')
						</div>
					</div>
@else
					<div class='col-xs-12'>
						<h2 class='text-danger text-center'>
							RuneTime is currently not streaming
						</h2>
						<div id='chatbox-holder' class='col-xs-12 holo-box-dark'>
@include('...partials.chat')
						</div>
					</div>
@endif
				</div>
			</div>
@stop