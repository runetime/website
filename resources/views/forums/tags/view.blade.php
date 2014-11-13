@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					{{ $tag->name }}
				</h1>
				<h3>
					News
				</h3>
@foreach($news as $newsPiece)
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
@endforeach
				<h3>
					Threads
				</h3>
@foreach($threads as $thread)
	@include('forums.subforum._thread', ['thread' => $thread])
@endforeach
			</div>
@stop