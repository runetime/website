@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<div class='thread'>
					<h1>
						{{$thread->title}} 
					</h1>
@if(!empty(json_decode($thread->tags)))
					<ul class='list-inline'>
	@foreach(json_decode($thread->tags) as $tag)
						<li>
							<a href='/forums/tag/{{$tag}}' class='label label-rt' title='{{$tag}}'>
								{{$tag}}
							</a>
						</li>
	@endforeach
					</ul>
@endif
@foreach($postList as $post)
					<div class='post row'>
						<div class='post-info'>
							<div class='pull-left'>
								{!!\Link::name($post->author_info->id)!!} 
							</div>
							<div class='pull-right'>
								(IP: {{\String::decodeIP($post->ip)}}) #{{$post->id}}
							</div>
							<div class='clearfix'>
							</div>
						</div>
						<div class='col-xs-12 col-sm-3 col-md-2 text-center'>
							{!!$post->author_info->title!!}
							<br />
							{!!\Image::userPhoto($post->author_id)!!}
							<br />
							{!!\Link::colorRole($post->author_info->importantRole()->id)!!} 
							<br />
							{{$post->author_info->posts_active}} posts
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
	@if(!empty(json_decode($post->author_info->awards)))
							<div class='post-awards'>
								<a href='/awards/user/{{\String::slugEncode($post->author_info->id, $post->author_info->display_name)}}' title="View {{$post->author_info->display_name}}'s awards">
									Awards
								</a>
	@endif
						</div>
						<div class='col-xs-12 col-sm-9 col-md-10'>
							{{$post->contents_parsed}}
	@if(!empty($post->author_info->signature_parsed))
							<hr />
							{{$post->author_info->signature_parsed}}
	@endif
	@if(\Auth::check())
							<ul class='list-inline'>
								<li>
									<a href='/forum/post/{{$post->id}}/report' title='Report This Post'>
										Report
									</a>
								</li>
		@if(\Auth::user()->hasOneOfRoles(1,6,10,11))
								<li>
									<a href='/forum/post/{{$post->id}}/edit' title='Edit This Post'>
										Edit
									</a>
								</li>
								<li>
									<a href='/forum/post/{{$post->id}}/status=0' title='Hide This Post'>
										Hide
									</a>
								</li>
								<li>
									<a href='/forum/post/{{$post->id}}/delete' title='Delete This Post'>
										Delete
									</a>
								</li>
		@endif
								<li>
									<a title='Quote This Post' onclick="RuneTime.Forum.Post.quote();">
										Quote
									</a>
								</li>
							</ul>
	@endif
						</div>
					</div>
@endforeach
				</div>
@if(\Auth::check())
				<form action='/forums/reply' class='reply' method='post'>
					<input type='hidden' name='thread' value='{{$thread->id}}' />
					<div class='row'>
						<div class='hidden-xs col-sm-3 col-md-2 col-lg-1'>
							{!!\Image::userPhoto(\Auth::user()->id, ['img-rounded'])!!}
						</div>
						<div class='col-xs-12 col-sm-9 col-md-10 col-lg-11'>
							<textarea name='contents' id='contents' rows='5'></textarea>
							<p>
								<button class='btn btn-primary' type='submit'>
									Post
								</button>
							</p>
						</div>
					</div>
				</form>
@endif
			</div>
@stop