@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Status Update by {{ $status->author->display_name }}
				</h1>
				<div class='well'>
					<div class='row row-flat'>
						<div class='col-xs-3 col-sm-2 col-md-1 padding-none'>
							{!! \Image::userPhoto($status->author->id, ['center-block']) !!}
						</div>
						<div class='col-xs-9 col-sm-10 col-md-11'>
							{!! \Link::name($status->author->id) !!}
							<br />
<p class='inline'>{!! $status->posts[0]->contents_parsed !!}</p>
							<span class='text-muted'>
								{{ \Time::shortReadable($status->created_at) }}
							</span>
						</div>
					</div>
				</div>
				<h3 id='comments'>
					Comments
				</h3>
@if(!empty($status->posts[1]))
	@foreach($status->posts as $x => $post)
		@if($x > 0)
			@include('forums.post._show')
		@endif
	@endforeach
@else
				<p class='text-warning'>
					<em>
						There are no comments!  Why not leave a message?
					</em>
				</p>
@endif
				<h3 id='comment'>
					Comment
				</h3>
@if(\Auth::check())
		@include('forums.post._edit', ['url' => '/forums/statuses/' . \String::slugEncode($status->id, 'by', $status->author->display_name) . '/reply'])
@else
	@include('forums.post._auth')
@endif
			</div>
@stop