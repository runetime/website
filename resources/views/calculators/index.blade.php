@extends('...layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Calculators
				</h1>
				<div class='row'>
@foreach($calculators as $calculator)
					<a href='/calculators/{{$calculator->name_trim}}'>
						<div class='col-xs-12 col-sm-6 col-md-3'>
							<img src='/img/skills/large/{{$calculator->name_trim}}.png' class='img-responsive pull-left' />
							<h2>
								{{$calculator->name}}
							</h2>
						</div>
					</a>
@endforeach
				</div>
			</div>
@stop