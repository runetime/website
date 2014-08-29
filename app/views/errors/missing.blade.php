@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<p class='lead text-danger'>
					Uh oh, 404!
				</p>
				<p class='text-info'>
					Looks like this page isn't here. :(
				</p>
				<p>
					{{HTML::link(Utilities::URL(),'Back to Homepage',['class'=>'btn btn-info btn-lg','role'=>'button'])}}
				</p>
			</div>
@stop