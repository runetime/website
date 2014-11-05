@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<p class='lead text-danger'>
					There was an error while signing you up!
				</p>
				<p class='text-info'>
					It looks like you didn't fill in all of the following forms:
				</p>
				<ul class='text-info'>
					<li>
						Username
					</li>
					<li>
						Email Address
					</li>
					<li>
						Password
					</li>
					<li>
						Password Confirmation
					</li>
				</ul>
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