@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<div class='row'>
					<div class='col-xs-12 col-sm-8 col-md-9'>
						<h2>
							News
						</h2>
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
					<div class='col-xs-12 col-sm-4 col-md-3'>
						<h3>
							Statuses
						</h3>
						<div class='sidebar-box'>
@foreach($statuses as $status)
							<div class='status'>
								{{var_dump($status)}} 
							</div>
@endforeach
						</div>
					</div>
				</div>
			</div>
@stop