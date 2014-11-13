@if($subforum->isRead())
				<div class='card card-read row'>
@else
				<div class='card card-unread row'>
@endif
					<div class='col-xs-12 col-sm-6 col-md-7'>
						<h3>
							<a href='/forums/{{\String::slugEncode($subforumItem->id, $subforumItem->name)}}'>
								{{$subforumItem->name}}
							</a>
						</h3>
						{{$subforumItem->description}}
					</div>
					<div class='col-xs-12 col-sm-6 col-md-2'>
						{{$subforumItem->thread_count}} threads
						<br />
						{{$subforumItem->post_count}} posts
					</div>
					<div class='col-xs-12 col-sm-12 col-md-3'>
		@if(!empty($subforumItem->last_post_info) && !empty($subforumItem->last_thread_info))
						<a href='/forums/thread/{{\String::slugEncode($subforumItem->last_thread_info->id, $subforumItem->last_thread_info->title)}}' title='{{$subforumItem->last_thread_title}}'>
							{{$subforumItem->last_thread_info->title}}
						</a>
						<br />
						by {!!\Link::name($subforumItem->last_post_info->author_id)!!}
						<br />
						<a href='/forums/thread/{{\String::slugEncode($subforumItem->last_thread_info->id, $subforumItem->last_thread_info->title)}}/last-post' title='{{$subforumItem->last_thread_title}}'>
							{!!\Time::shortReadable($subforumItem->last_post_info->created_at)!!}
						</a>
		@endif
					</div>
				</div>