@extends('...layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					{{$news->title}} 
				</h1>
				<p class='text-muted'>
					{{Time::shortTime($news->created_at)}} by {!!Link::name($news->author_id)!!} 
				</p>
				<div class='holo-box-dark'>
					<img src='/img/news/{{$news->id}}.png' alt='{{$news->title}}' class='float-right img-news' />
					{{$news->contents_parsed}} 
				</div>
				<p>
					Tagged in {{$tags}}
				</p>
				<h2>
					Comments
				</h2>
@foreach($comments as $comment)
				<div class='holo-box-dark row'>
					<div class='col-xs-3'>
						<img src='/img/forum/photos/{{$comment->author_id}}.png' class='img-responsive img-rounded' />
					</div>
					<div class='col-xs-9'>
						<p class='pull-right holo-text-primary'>
							{{Time::long($comment->created_at)}} 
						</p>
					</div>
				</div>
			</div>
@endforeach
@stop