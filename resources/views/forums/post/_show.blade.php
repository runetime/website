					<div id='post{{ $post->id }}' class='post row{{ $post->status == 0 ? " post-hidden" : "" }} {{ $post->userVote() }}' rt-data='post#{{ $post->id }}'>
						<div class='post-info col-xs-12'>
							<div class='pull-left'>
								{!! \Link::name($post->author->id) !!} <span class='text-muted'>{{ \Time::shortReadable($post->created_at) }}</span>
							</div>
							<div class='pull-right'>
								{{ \Auth::check() && \Auth::user()->isCommunity() ? "(IP: " . \String::decodeIP($post->ip) . ") " : "" }}<a href='{{ $url }}#post{{ $post->id }}'>#{{ $post->id }}</a>
							</div>
							<div class='clearfix'>
							</div>
						</div>
						<div class='col-xs-12 post-data row row-flat'>
							<div class='col-xs-12 col-sm-3 col-md-2 text-center'>
								{!! \Image::userPhoto($post->author->id, ['center-block']) !!}
@if(strlen($post->author->title) > 0)
								{!! \String::color($post->author->title, $post->author->importantRole()->id, false) !!}
								<br />
@endif
								{!! \Link::colorRole($post->author->importantRole()->id) !!}
								<br />
								{{ $post->author->posts_active }} posts
								<br />
								{{ $post->author->rank->name }}
								<div class='badge-{{ $post->author->rank->toClassName() }}'>
									<div>
									</div>
								</div>
	@if(!empty($post->author_info->location))
								<br />
								<span class='text-muted'>:</span> {{ $post->author_info->location }}
	@endif
	@if(!empty($post->author_info->rsn))
								<br />
								<span class='text-muted'>:</span> {{ $post->author_info->rsn }}
	@endif
	@if(!empty($post->author_info->allegiance))
								<br />
								<span class='text-muted'>:</span> {{ $post->author_info->allegiance }}
	@endif
							</div>
							<div class='col-xs-12 col-sm-9 col-md-10'>
								<div class='post-contents' rt-data='post#{{ $post->id }}:contents'>
									{!! $post->contents_parsed !!}
									<div class='hidden' rt-data='post#{{ $post->id }}:source'>{!! $post->contents !!}</div>
								</div>
	@if(!empty($post->author->signature_parsed))
								<hr />
								{!! $post->author->signature_parsed !!}
	@endif
								<div class='clearfix'>
									<ul class='list-inline pull-left'>
	@if(\Auth::check())
		@if(\Auth::user()->id != $post->author_id)
										<li>
											<a href='/forums/post/{{ $post->id }}/report' title='@lang('forums.post.show.bar.report')'>
												@lang('forums.post.show.bar.report')
											</a>
										</li>
		@endif
		@if(\Auth::user()->isCommunity() || \Auth::user()->id == $post->author_id)
										<li>
											<a href='/forums/post/{{ $post->id }}/edit' title='@lang('forums.post.show.bar.edit')'>
												@lang('forums.post.show.bar.edit')
											</a>
										</li>
		@endif
		@if(\Auth::user()->isCommunity())
										<li>
											<a href='/forums/post/{{ $post->id }}/status=0' title='@lang('forums.post.show.bar.hide')'>
												@lang('forums.post.show.bar.hide')
											</a>
										</li>
										<li>
											<a href='/forums/post/{{ $post->id }}/delete' title='@lang('forums.post.show.bar.delete')'>
												@lang('forums.post.show.bar.delete')
											</a>
										</li>
		@endif
		@if(\Auth::check())
										<li>
											<a title='@lang('forums.post.show.bar.quote')' rt-hook='forums.thread.post:quote' rt-data='{{ $post->id }}'>
												@lang('forums.post.show.bar.quote')
											</a>
										</li>
		@endif
	@endif
								</ul>
								<div class='post-votes pull-right'>
	@if(!empty($post->thread[0]))
									{{ $post->rep }}
		@if(\Auth::check())
									<i class='fa fa-arrow-up fa-2x upvote'></i>
									<i class='fa fa-arrow-down fa-2x downvote'></i>
		@endif
	@endif
								</div>
							</div>
						</div>
					</div>
				</div>