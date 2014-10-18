@extends('layouts.forum')
@section('forum')
						<h1>
					{{$subforum->name}}
				</h1>
				<p class='text-muted'>
					{!!$subforum->description!!}
				</p>
				<div class='pull-left'>
				</div>
				<div class='pull-right'>
					<ul class='list-inline'>
						<li>
							<i class='fa fa-check'></i> Mark Read
						</li>
						<li>
							<a href='/forums/create/{{\String::slugEncode($subforum->id,$subforum->name)}}' class='btn btn-primary btn-sm}' role='button'{{!\Auth::check()?' disabled':''}}>
								Start New Topic
							</a>
						</li>
					</ul>
				</div>
				<div class='clearfix'>
				</div>
@if(!empty($subforumList))
	@foreach($subforumList as $subforumItem)
				<div class='card card-read row'>
					<div class='col-xs-12 col-sm-6 col-md-8'>
						<h3>
							<a href='/forums/{{\String::slugEncode($subforumItem->id, $subforumItem->name)}}'>
								{{$subforumItem->name}}
							</a>
						</h3>
						{{$subforumItem->description}}
					</div>
					<div class='col-xs-12 col-sm-6 col-md-1'>
						{{$subforumItem->threads}} threads
						<br />
						{{$subforumItem->posts}} posts
					</div>
					<div class='col-xs-12 col-sm-12 col-md-3'>
		@if(!empty($subforumItem->last_post_info))
						<a href='/forum/thread/{{\String::slugEncode($subforumItem->last_thread_info->id, $subforumItem->last_thread_info->title)}}' title='{{$subforumItem->last_thread_title}}'>
							{{$subforumItem->last_thread_info->title}}
						</a>
						<br />
						by {!!\Link::name($subforumItem->last_post_info->author_id)!!}
						<br />
						<a href='/forum/thread/{{\String::slugEncode($subforumItem->last_thread_info->id, $subforumItem->last_thread_info->title)}}/last-post' title='{{$subforumItem->last_thread_title}}'>
							{!!\Time::shortReadable($subforumItem->last_post_info->created_at)!!}
						</a>
		@endif
					</div>
				</div>
	@endforeach
@endif
@if(!empty($threads))
	@foreach($threads as $thread)
				<div class='card card-read row'>
					<div class='col-xs-12 col-sm-6 col-md-8'>
						<a href='/forums/thread/{{\String::slugEncode($thread->id, $thread->title)}}' title='{{$thread->title}}'>
							{{$thread->title}}
						</a>
						<br />
						Started by {!!\Link::name($thread->author_id)!!}, {{\Time::shortReadable($thread->created_at)}}
		@foreach(json_decode($thread->tags) as $tag)
						<a href='/forums/tag/{{$tag}}' class='label label-rt' title='{{$tag}}'>{{$tag}}</a>
		@endforeach
					</div>
					<div class='col-xs-12 col-sm-6 col-md-1'>
						{{$thread->posts-1}} posts
						<br />
						{{$thread->views}} views
					</div>
					<div class='col-xs-12 col-sm-12 col-md-3'>
		@if($thread->last_post > 0)
						{!!\Link::name($thread->last_post_info->author_id)!!}
						<br />
						{{\Time::shortReadable($thread->last_post_info->created_at)}}
		@endif
					</div>
				</div>
	@endforeach
@endif
@stop