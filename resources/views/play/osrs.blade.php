@extends('layouts.default')
@section('contents')
			<div class='wrapper-flat'>
				<div class='embed-responsive embed-responsive-16by9'>
					<iframe class='embed-responsive-item' src='http://oldschool82.runescape.com/j1'></iframe>
				</div>
				<div id='chatbox-holder' class='col-xs-12 holo-box-dark'>
@include('partials.chat')
				</div>
			</div>
@stop