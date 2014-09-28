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
					{{HTML::link(Utilities::URL('signup'),'Back to Signup',['class'=>'btn btn-info btn-lg','role'=>'button'])}}
				</p>
				<p>
					{{HTML::link(Utilities::URL(),'Back to Homepage',['class'=>'btn btn-info btn-lg','role'=>'button'])}}
				</p>
			</div>
@stop