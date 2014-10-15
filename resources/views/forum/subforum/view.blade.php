@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
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
				<table class='table table-hover'>
					<tbody>
	@foreach($subforumList as $subforumItem)
						<tr>
							<td>
								-
							</td>
							<td>
								<h3>
									<a href='/forums/{{\String::slugEncode($subforumItem->id, $subforumItem->name)}}'>
										{{$subforumItem->name}} 
									</a>
								</h3>
								{{$subforumItem->description}} 
							</td>
							<td>
								{{$subforumItem->threads}} threads
								<br />
								{{$subforumItem->posts}} posts
							</td>
							<td>
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
							</td>
						</tr>
	@endforeach
					</tbody>
				</table>
@endif
@if(!empty($threads))
				<table class='table table-hover threads'>
					<tbody>
	@foreach($threads as $thread)
						<tr>
							<td>
								&nbsp;
							</td>
							<td>
								<a href='/forums/thread/{{\String::slugEncode($thread->id, $thread->title)}}' title='{{$thread->title}}'>
									{{$thread->title}} 
								</a> 
								<br />
								Started by {!!\Link::name($thread->author_id)!!}, {{\Time::shortReadable($thread->created_at)}} 
		@foreach(json_decode($thread->tags) as $tag)
								<a href='/forums/tag/{{$tag}}' class='label label-rt' title='{{$tag}}'>{{$tag}}</a> 
		@endforeach
							</td>
							<td>
								{{$thread->posts-1}} posts
								<br />
								{{$thread->views}} views
							</td>
							<td>
		@if($thread->last_post > 0)
								{!!\Link::name($thread->last_post_info->author_id)!!} 
								<br />
								{{\Time::shortReadable($thread->last_post_info->created_at)}} 
		@endif
							</td>
						</tr>
	@endforeach
					</tbody>
				</table>
@endif
			</div>
@stop