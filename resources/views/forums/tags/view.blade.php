@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					{{ $tag->name }}
				</h1>
				<h3>
					@lang('news.title')
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
                               @lang('utilities.read_more')
                            </a>
                        </li>
                        <li>
                            <a href='/news/{{ \String::slugEncode($newsPiece->id, $newsPiece->title) }}#comments') }}'>
                                @lang('utilities.comments', ['amount' => $newsPiece->post_count])
                            </a>
                        </li>
                    </ul>
                </div>
@endforeach
				<h3>
					@lang('forums.thread.titles')
				</h3>
@foreach($threads as $thread)
	@include('forums.subforum._thread', ['thread' => $thread])
@endforeach
			</div>
@stop