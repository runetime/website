@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					News
				</h1>
@if($canAdd)
				<div class='clearfix'>
					<ul class='list-inline pull-right'>
						<li>
							<a href='/news/create' class='btn btn-primary' title='Create News Piece'>
								<i class='fa fa-plus'></i> Create Newspiece
							</a>
						</li>
					</ul>
				</div>
@endif
@foreach($news as $newsPiece)
				<div class='news'>
					<h3>
						{{ $newsPiece->title }}
					</h3>
					<span class='text-muted'>{{ \Time::long($newsPiece->id) }}</span> by {!! \Link::name($newsPiece->author_id) !!}
					</span>
					<p>
						{!! $newsPiece->contents_parsed !!}
					</p>
					<ul class='list-inline'>
						<li>
							<a href='{{ \Link::URL('news/'.String::slugEncode($newsPiece->id,$newsPiece->title)) }}' title='{{ $newsPiece->title }}'>
								Read More
							</a>
						</li>
						<li>
							<a href='{{ \Link::URL('news/'.String::slugEncode($newsPiece->id,$newsPiece->title).'#comments') }}' title='{{ $newsPiece->comments }} comments'>
								{{ $newsPiece->post_count }} comments
							</a>
						</li>
					</ul>
				</div>
@endforeach
			</div>
@stop