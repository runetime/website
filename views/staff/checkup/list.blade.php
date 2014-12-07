@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
@foreach($checkups as $checkup)
				<div class='well well-sm'>
					<p>
						{!!\Link::name($checkup->author()->first()->id)!!}
					</p>
					<p>
						Submitted at {{\Time::long($checkup->created_at)}}
					</p>
					<a href='/staff/checkup/view/{{$checkup->id}}'>
						Click to view Checkup
					</a>
				</div>
@endforeach
			</div>
@stop