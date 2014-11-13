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
							<div class='holo-box-dark'>
								<h3>
									{{ $newsPiece->title }}
								</h3>
								<span class='text-muted'>{{ Time::long($newsPiece->id) }}</span> by {!! \Link::Name($newsPiece->author_id) !!}
								<p>
									{!! $newsPiece->contents_parsed !!}
								</p>
								<ul class='list-inline'>
									<li>
										<a href='/news/{{ \String::slugEncode($newsPiece->id, $newsPiece->title) }}' title='{{ $newsPiece->title }}'>
											Read More
										</a>
									</li>
									<li>
										<a href='/news/{{ \String::slugEncode($newsPiece->id, $newsPiece->title) }}#comments') }}' title='{{ $newsPiece->comments }} comments'>
											{{ $newsPiece->post_count }} comments
										</a>
									</li>
								</ul>
							</div>
						</div>
@endforeach
					</div>
					<div class='col-xs-12 col-sm-4 col-md-3'>
						<h3>
							Status Updates
						</h3>
						<div class='sidebar-box'>
@foreach($statuses as $status)
							<div class='status'>
								{{ var_dump($status) }}
							</div>
@endforeach
						</div>
						<h3>
							Recent Topics
						</h3>
						<div class='sidebar-box'>
@foreach($threads as $thread)
							{{ $thread->title }}

@endforeach
						</div>
					</div>
				</div>
			</div>
@stop