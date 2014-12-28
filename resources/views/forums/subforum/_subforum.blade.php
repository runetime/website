@if($subforum->isRead())
				<div class='card card-read row'>
@else
				<div class='card card-unread row'>
@endif
					<div class='col-xs-12 col-sm-6 col-md-7'>
						<h3>
							<a href='{{ $subforum->toSlug() }}'>
								{{ $subforum->name }}
							</a>
						</h3>
						{{ $subforum->description }}
					</div>
					<div class='col-xs-12 col-sm-6 col-md-2'>
						@lang('forums.threads', ['amount' => $subforum->thread_count])
						<br />
						@lang('forums.posts', ['amount' => $subforum->post_count])
					</div>
					<div class='col-xs-12 col-sm-12 col-md-3'>
		@if(!empty($subforum->lastPost()))
						<a href='{{ $subforum->lastThread()->toSlug() }}' title='{{ $subforum->lastThread()->title }}'>
							{{$subforum->lastThread()->title}}
						</a>
						<br />
						@lang('utilities.by') {!! \Link::name($subforum->lastPost()->author_id) !!}
						<br />
						<a href='{{ $subforum->lastThread()->toSlug() }}/last-post' title='{{ $subforum->lastThread()->title }}'>
							{!! \Time::shortReadable($subforum->lastPost()->created_at) !!}
						</a>
		@endif
					</div>
				</div>