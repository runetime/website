@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<p class='lead text-danger'>
					You've Banned!
				</p>
				<p class='text-info'>
					We're sorry, but it looks like you've been banned until {{ $time }}.  This may have been an accident.  If you feel it was an accident please message us over at <a href='https://twitter.com/Rune_Time' title='@lang('footer.twitter')'>Twitter</a>.  Here is the reason that was given for you being banned:
				</p>
				<p>
					{{ $ban->reason }}
				</p>
			</div>
@stop