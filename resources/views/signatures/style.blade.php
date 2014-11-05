@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<div class='row'>
@foreach($imgs as $img)
					<div class='col-xs-12 col-sm-6 col-md-3'>
						<a href='/signatures/username={{$username}}/type={{$type}}/style={{str_replace('.png','',$img)}}'>
							<img src='/img/signatures/backgrounds/{{$img}}' />
						</a>
					</div>
@endforeach
				</div>
			</div>
@stop