@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Recent Status Updates
				</h1>
@foreach($statusList as $status)
				<div class='card row row-flat'>
					<div class='col-xs-3 col-sm-2 col-md-1 padding-none'>
						<img src='/img/forums/photos/{{ $status->author->id }}.png' class='img-responsive center-block' />
					</div>
					<div class='col-xs-9 col-sm-10 col-md-11'>
						{!! \Link::name($status->author->id) !!} <span class='text-muted'>{{ \Time::shortReadable($status->created_at) }}</span>
						<br />
						<p class='inline'>{!! $status->posts[0]->contents_parsed !!}</p>
						<ul class='list-inline'>
							<li>
								<a href='/forums/statuses/{{ \String::slugEncode($status->id, 'by-', $status->author->display_name) }}'>
									Read More
								</a>
							</li>
							<li>
								<a href='/forums/statuses/{{ \String::slugEncode($status->id, 'by-', $status->author->display_name) }}#comments'>
									{{ $status->reply_count }} replies
								</a>
							</li>
						</ul>
					</div>
				</div>
@endforeach
			</div>
@stop