@extends('layouts.default')
@section('contents')
			<div class='wrapper-flat'>
				<br />
				<div class='row row-flat'>
					<div class='col-xs-12 col-md-9'>
@foreach($subforumList[-1] as $subforums)
	@if(empty(json_decode($subforums->roles)) || Auth::check() && in_array(\Auth::user()->importantRole()->id,json_decode($subforums->roles)))
						<div class='panel panel-dark'>
							<div class='panel-heading'>
								<h3 class='panel-title'>
									<a href='/forums/{{\String::slugEncode($subforums->id,$subforums->name)}}' title='{{$subforums->name}}'>
										{{$subforums->name}} 
									</a>
								</h3>
							</div>
							<div class='panel-body padding-none'>
								<table class='table table-subforums'>
									<tbody>
		@foreach($subforumList[$subforums->id] as $subforum)
			@if(empty(json_decode($subforum->roles)) || \Auth::check() && in_array(\Auth::user()->importantRole()->id,json_decode($subforum->roles)))
										<tr>
											<td>
											</td>
											<td>
												<h4>
													<a href='/forums/{{\String::slugEncode($subforum->id,$subforum->name)}}' title='{{$subforum->name}}'>
														{{$subforum->name}} 
													</a>
												</h4>
												{{$subforum->description}} 
											</td>
											<td>
												{{$subforum->threads}} threads
												<br />
												{{$subforum->posts}} posts
											</td>
											<td>
				@if(!empty($subforum->last_post_info))
												<a href='/forums/thread/{{\String::slugEncode($subforum->last_thread_info->id, $subforum->last_thread_info->title)}}' title='{{$subforum->last_thread_title}}'>
													{{$subforum->last_thread_info->title}} 
												</a>
												<br />
												by {!!\Link::name($subforum->last_post_info->author_id)!!} 
												<br />
												<a href='/forums/thread/{{\String::slugEncode($subforum->last_thread_info->id, $subforum->last_thread_info->title)}}/last-post' title='{{$subforum->last_thread_title}}'>
													{!!\Time::shortReadable($subforum->last_post_info->created_at)!!} 
												</a>
				@endif
											</td>
										</tr>
			@endif
		@endforeach
									</tbody>
								</table>
							</div>
						</div>
	@endif
@endforeach
					</div>
					<div class='col-xs-12 col-md-3'>
						<h3>
							Recent Threads
						</h3>
						<div class='holo-box-dark'>
@foreach($recentThreads as $thread)
							<div class='holo-box-in'>
								{!!\Image::userPhoto($thread->author_id,['photo-sm','pull-left'])!!} 
								<a href='/forums/thread/{{\String::slugEncode($thread->id, $thread->title)}}' title='{{$thread->title}}'>
									{{$thread->title}} 
								</a>
								<br />
								{!!\Link::name($thread->author_id)!!}, <span class='text-muted'>{{\Time::shortReadable($thread->created_at)}}</span>
							</div>
@endforeach
						</div>
						<h3>
							Recent Posts
						</h3>
					</div>
				</div>
			</div>
@stop