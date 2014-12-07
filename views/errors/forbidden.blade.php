@extend('layouts.default')
@section('content');
			<div class='wrapper'>
				<p class='lead text-danger'>
					You don't have access to this page.
				</p>
				<p class='text-info'>
					It looks like you don't have access to this page!  Most likely it's a staff-only page, sorry. :(
				</p>
				<p>
					{{HTML::link(Utilities::URL(),'Back to Homepage',['class'=>'btn btn-info btn-lg','role'=>'button'])}}
				</p>
			</div>
@stop