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
					<span class='text-muted'>{{Time::long($newsPiece->id)}}</span> by {!!Link::name($newsPiece->author_id)!!} in
					</span>
					<p>
						{{$newsPiece->contents}}
					</p>
					<ul class='list-inline'>
						<li>
							<a href='{{Link::URL('news/'.String::slugEncode($newsPiece->id,$newsPiece->title))}}' title='{{$newsPiece->title}}'>
								Read More
							</a>
						</li>
						<li>
							<a href='{{Link::URL('news/'.String::slugEncode($newsPiece->id,$newsPiece->title).'#comments')}}' title='{{$newsPiece->comments}} comments'>
								{{$newsPiece->comments}} comments
							</a>
						</li>
					</ul>
				</div>
@endforeach
			</div>
@stop