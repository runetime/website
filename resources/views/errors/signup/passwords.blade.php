@extends('......layouts.default')
@section('contents')
			<div class='wrapper'>
				<p class='lead text-danger'>
					There was an error while signing you up!
				</p>
				<p class='text-info'>
					It looks like the two passwords you entered didn't match.  Please try again!
				</p>
				<p>
					<a href='/signup' title='Back to Signup' class='btn btn-info btn-lg' role='button'>
						Back to Signup
					</a>
				</p>
				<p>
					<a href='/' title='Back to Homepage' class='btn btn-info btn-lg' role='button'>
						Back to Homepage
					</a>
				</p>
			</div>
@stop