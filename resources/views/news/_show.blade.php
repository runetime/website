			<div class='wrapper'>
				<h1>
					{{ $news->title }}
				</h1>
				<p class='text-muted'>
					{{Time::shortTime($news->created_at)}} by {!! Link::name($news->author_id) !!}
				</p>
			</div>
			<div class='wrapper-dark'>
				<div class='clearfix'>
@if(file_exists(\base_path('/img/news/' . $news->id . '.png')))
					<img src='/img/news/{{ $news->id }}.png' alt='{{ $news->title }}' class='float-right img-news img-responsive' style='max-width: 400px;' />
@endif
				</div>
				{!! $news->contents_parsed !!}
			</div>
			<div class='wrapper'>
				Tagged as
				<ul class='list-inline inline'>
@foreach($tags as $tag)
					<li>
						<a href='/forums/tag/{{ $tag->name }}' class='label label-rt' title='{{ $tag->name }}'>
							{{ $tag->name }}
						</a>
					</li>
@endforeach
				</ul>