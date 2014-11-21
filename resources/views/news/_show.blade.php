			<div class='wrapper'>
				<h1>
					{{ $news->title }}
				</h1>
				<p class='text-muted'>
					{{ \Time::shortTime($news->created_at) }} by {!! \Link::name($news->author_id) !!}
				</p>
			</div>
			<div class='wrapper-dark'>
@if($news->hasImage())
                <img src='/img/news/thumbnail/{{ $news->id }}.png' alt='{{ $news->title }}' class='pull-right img-news img-responsive' />
@endif
				{!! $news->contents_parsed !!}
			</div>
			<div class='wrapper'>
				Tagged as
				<ul class='list-inline inline'>
@foreach($news->tags as $tag)
					<li>
						<a href='/forums/tag/{{ $tag->name }}' class='label label-rt' title='{{ $tag->name }}'>
							{{ $tag->name }}
						</a>
					</li>
@endforeach
				</ul>