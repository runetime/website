			<div class='news'>
				<div class='item'>
					<div class='body clearfix'>
@if($newsPiece->hasImage())
						<img src='/img/news/thumbnail/{{ $newsPiece->id }}.png' alt='{{ $newsPiece->title }}' class='pull-right img-news img-responsive' />
@endif
						<h3>
							{{ $newsPiece->title }}
						</h3>
						<span class='text-muted'>{{ \Time::long($newsPiece->created_at) }}</span> by {!! \Link::Name($newsPiece->author_id) !!}
						<p>
							{!! $newsPiece->contents_parsed !!}
						</p>
					</div>
					<div class='tags'>
					@lang('tags.tagged_as')
						<ul class='list-inline inline'>
@if(count($newsPiece->tags) > 0)
	@foreach($newsPiece->tags as $tag)
							<li>
								<a href='/forums/tag/{{ $tag->name }}' class='label label-rt' title='{{ $tag->name }}'>
									{{ $tag->name }}
								</a>
							</li>
	@endforeach
@endif
						</ul>
					</div>
					<ul class='list-inline material-bar'>
						<li>
							<a href='/news/{{ \String::slugEncode($newsPiece->id, $newsPiece->title) }}' title='{{ $newsPiece->title }}'>
								@lang('utilities.read_more')
							</a>
						</li>
						<li>
							<a href='{{ $newsPiece->toSlug('#comments') }}'>
								@lang('utilities.comments_amount', ['amount' => $newsPiece->post_count])
							</a>
						</li>
					</ul>
				</div>
			</div>