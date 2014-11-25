@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Radio Live Center
				</h1>
				<div class='row row-flat text-center'>
					<div class='col-xs-12 col-sm-4'>
						<h3 class='holo-text'>
							Current Song
						</h3>
						<p rt-data='radio.panel:current.song'>
							<span class='holo-text-secondary' rt-data='radio.panel:current.song.name'>N/A</span> by <span class='holo-text-secondary' rt-data='radio.panel:current.song.artist'>N/A</span>
						</p>
					</div>
					<div class='col-xs-12 col-sm-4'>
						<h3 class='holo-text'>
							Current Message
						</h3>
						<p rt-data='radio.panel:current.message'></p>
						<h3 class='holo-text'>
							Messages
						</h3>
@foreach($messages as $message)
						<p>
							<a rt-data='radio.panel:message.update' rt-data2='{{ $message->id }}'>{!! $message->contents_parsed !!}</a>
						</p>
@endforeach
					</div>
					<div class='col-xs-12 col-sm-4'>
						<h3 class='holo-text'>
							Requests
						</h3>
						<div rt-data='radio.panel:requests'>
						</div>
					</div>
				</div>
			</div>
			<script src='/js/admin_radio_live.js'></script>
@stop