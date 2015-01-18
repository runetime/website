@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
<?php $x = 1; ?>
@foreach($imgs as $img)
	@if($x === 1)
				<div class='row'>
	@endif
					<div class='col-xs-12 col-sm-6 col-md-3'>
						<a href='/signatures/username={{ $username }}/type={{ $type }}/style={{ str_replace('.png', '', $img) }}'>
							<img src='/img/signatures/backgrounds/{{ $img }}' />
						</a>
					</div>
<?php $x += 1; ?>
	@if($x === 5)
				</div>
<?php $x = 1; ?>
	@endif
@endforeach
			</div>
@stop