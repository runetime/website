					<div id='post{{ $post->id }}' class='post row{{$post->status == 0 ? " post-hidden" : ""}} {{ $post->userVote() }}' rt-data='post#{{ $post->id }}'>
						<div class='post-info col-xs-12'>
							<div class='pull-left'>
								{!!\Link::name($post->author->id)!!} <span class='text-muted'>{{ \Time::shortReadable($post->created_at) }}</span>
							</div>
							<div class='pull-right'>
								{{ \Auth::check() && \Auth::user()->isCommunity() ? "(IP: " . \String::decodeIP($post->ip) . ") " : "" }}<a href='{{ $url }}#post{{ $post->id }}'>#{{ $post->id }}</a>
							</div>
							<div class='clearfix'>
							</div>
						</div>
						<div class='col-xs-12 post-data row row-flat'>
							<div class='col-xs-12 col-sm-3 col-md-2 text-center'>
								{!!$post->author->title!!}
								<br />
								{!!\Image::userPhoto($post->author->id)!!}
								<br />
								{!!\Link::colorRole($post->author->importantRole()->id)!!}
								<br />
								{{$post->author->posts_active}} posts
								<div class='badge-{{ $post->author->rank->toClassName() }}'>
									<div>
									</div>
								</div>
	@if(!empty($post->author_info->location))
								<br />
								<span class='text-muted'>:</span> {{$post->author_info->location}}
	@endif
	@if(!empty($post->author_info->rsn))
								<br />
								<span class='text-muted'>:</span> {{$post->author_info->rsn}}
	@endif
	@if(!empty($post->author_info->allegiance))
								<br />
								<span class='text-muted'>:</span> {{$post->author_info->allegiance}}
	@endif
	@if(!empty(json_decode($post->author->awards)))
								<div class='post-awards'>
									<a href='/awards/user/{{\String::slugEncode($post->author_info->id, $post->author_info->display_name)}}' title="View {{$post->author_info->display_name}}'s awards">
										Awards
									</a>
	@endif
							</div>
							<div class='col-xs-12 col-sm-9 col-md-10'>
								<div class='post-contents' rt-data='post#{{ $post->id }}:contents'>
									{!!$post->contents_parsed!!}
									<div class='hidden' rt-data='post#{{ $post->id }}:source'>{!! $post->contents !!}</div>
								</div>
	@if(!empty($post->author_info->signature_parsed))
								<hr />
								{{$post->author_info->signature_parsed}}
	@endif
								<div class='clearfix'>
									<ul class='list-inline pull-left'>
	@if(\Auth::check())
		@if(\Auth::user()->id != $post->author_id)
										<li>
											<a href='/forums/post/{{$post->id}}/report' title='Report This Post'>
												Report
											</a>
										</li>
		@endif
		@if(\Auth::user()->isCommunity() || \Auth::user()->id == $post->author_id)
										<li>
											<a href='/forums/post/{{$post->id}}/edit' title='Edit This Post'>
												Edit
											</a>
										</li>
		@endif
		@if(\Auth::user()->isCommunity())
										<li>
											<a href='/forums/post/{{$post->id}}/status=0' title='Hide This Post'>
												Hide
											</a>
										</li>
										<li>
											<a href='/forums/post/{{$post->id}}/delete' title='Delete This Post'>
												Delete
											</a>
										</li>
		@endif
		@if(\Auth::check())
										<li>
											<a title='Quote This Post' onclick="RuneTime.Forums.Post.quote({{ $post->id }});">
												Quote
											</a>
										</li>
		@endif
	@endif
								</ul>
								<div class='post-votes pull-right'>
	@if(\Auth::check())
									<i class='fa fa-arrow-up fa-2x upvote'></i>
									<i class='fa fa-arrow-down fa-2x downvote'></i>
	@endif
								</div>
							</div>
						</div>
					</div>
				</div>