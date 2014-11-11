					<div class='post row{{$post->status == 0 ? " post-hidden" : ""}}'>
						<div class='post-info'>
							<div class='pull-left'>
								{!!\Link::name($post->author->id)!!}
							</div>
							<div class='pull-right'>
								{{\Auth::check()&&\Auth::user()->hasOneOfRoles(1, 10, 11)?"(IP: " . \String::decodeIP($post->ip) . ") ":""}}#{{$post->id}}
							</div>
							<div class='clearfix'>
							</div>
						</div>
						<div class='col-xs-12 col-sm-3 col-md-2 text-center'>
							{!!$post->author->title!!}
							<br />
							{!!\Image::userPhoto($post->author->id)!!}
							<br />
							{!!\Link::colorRole($post->author->importantRole()->id)!!}
							<br />
							{{$post->author->posts_active}} posts
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
							{!!$post->contents_parsed!!}
	@if(!empty($post->author_info->signature_parsed))
							<hr />
							{{$post->author_info->signature_parsed}}
	@endif
	@if(\Auth::check())
							<ul class='list-inline'>
	    @if(\Auth::user()->id != $post->author_id)
								<li>
									<a href='/forums/post/{{$post->id}}/report' title='Report This Post'>
										Report
									</a>
								</li>
		@endif
		@if(\Auth::user()->hasOneOfRoles(1, 10, 11) || \Auth::user()->id == $post->author_id)
								<li>
									<a href='/forums/post/{{$post->id}}/edit' title='Edit This Post'>
										Edit
									</a>
								</li>
		@endif
		@if(\Auth::user()->hasOneOfRoles(1, 10, 11))
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
									<a title='Quote This Post' onclick="RuneTime.Forum.Post.quote();">
										Quote
									</a>
								</li>
		@endif
							</ul>
	@endif
						</div>
					</div>