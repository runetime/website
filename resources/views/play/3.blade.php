@extends('layouts.default')
@section('contents')
			<div class='wrapper-flat'>
                <div class='embed-responsive embed-responsive-16by9'>
                    <iframe class='embed-responsive-item' src='http://www.runescape.com/game' scrolling='no'></iframe>
                </div>
				<div id='chatbox-holder' class='holo-box-dark'>
@include('partials.chat')
				</div>
			</div>
			<script src='/js/play.js'></script>
@stop