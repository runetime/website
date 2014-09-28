@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					News
				</h1>
@if($canAdd)
				<ul class='list-inline'>
					<li>
						<a href='/news/create' title='Create News Piece'>
							<i class='fa fa-plus'></i> Create Newspiece
						</a>
					</li>
				</ul>
@endif
@foreach($news as $newsPiece)
				<div class='news'>
					<h3>
						{{$newsPiece->title}} 
					</h3>
					<span class='text-muted'>{{Time::long($newsPiece->id)}}</span> by {{Utilities::linkName($newsPiece->author_id)}} in
	@foreach(explode(",",$newsPiece->tags) as $tag)
<a href='{{Utilities::URL('news/tags/'.$tag)}}' title='{{ucwords($tag)}}'>{{ucwords($tag)}}</a>
	@endforeach
					</span>
					<p>
						{{$newsPiece->contents}}
					</p>
					<ul class='list-inline'>
						<li>
							<a href='{{Utilities::URL('news/'.$newsPiece->id)}}' title='{{$newsPiece->title}}'>
								Read More
							</a>
						</li>
						<li>
							<a href='{{Utilities::URL('news/'.$newsPiece->id.'#comments')}}' title='{{$newsPiece->comments}} comments'>
								{{$newsPiece->comments}} comments
							</a>
						</li>
					</ul>
				</div>
@endforeach
			</div>