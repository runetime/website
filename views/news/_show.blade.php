			<div class='news'>
				<h1>
					{{ $news->title }}
				</h1>
				<p class='text-muted'>
					{{ \Time::shortTime($news->created_at) }} @lang('utilities.by') {!! \Link::name($news->author_id) !!}
				</p>
				<div class='clearfix'>
@if($news->hasImage())
					<img src='/img/news/thumbnail/{{ $news->id }}.png' alt='{{ $news->title }}' class='pull-right img-news img-responsive' />
@endif
				</div>
				{!! $news->contents_parsed !!}
				@lang('tags.tagged_as')
				<ul class='list-inline inline'>
@foreach($news->tags as $tag)
					<li>
						<a href='/forums/tag/{{ $tag->name }}' class='label label-rt' title='{{ $tag->name }}'>
							{{ $tag->name }}
						</a>
					</li>
@endforeach
				</ul>
			</div>