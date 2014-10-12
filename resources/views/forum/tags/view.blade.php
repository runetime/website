@extends('layouts.default')
@section('contents')
			<div class='wrapper-flat'>
				<h1>
					{{$tag->name}} 
				</h1>
				<table class='table table-hover threads'>
					<tbody>
@foreach($threadList as $thread)
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
			</div>
@stop