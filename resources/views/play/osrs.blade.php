@extends('layouts.default')
@section('contents')
			<div class='wrapper-flat'>
				<div class='embed-responsive embed-responsive-16by9'>
					<iframe class='embed-responsive-item' src='http://oldschool82.runescape.com/j1'></iframe>
				</div>
				<div id='chatbox-holder'>
@include('partials._chat')
				</div>
			</div>
			<script>
				$(function () {
                    chatbox = new Chatbox('radio');
                });
			</script>
@stop