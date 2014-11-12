@if($thread->isRead())
	@if($thread->isPinned())
<div class='card card-read card-pinned row'>
	@elseif($thread->isLocked())
<div class='card card-read card-locked row'>
	@elseif(!$thread->isVisible())
<div class='card card-read card-hidden row'>
	@elseif($thread->isPoll())
<div class='card card-read card-poll row'>
	@else
<div class='card card-read row'>
	@endif
@else
<div class='card card-unread row'>
@endif
	<div class='col-xs-12 col-sm-6 col-md-8'>
		<div class='pull-left'>
@if($thread->isPinned())
			<span class='label label-pinned'>pinned</span>
@endif
@if($thread->isLocked())
			<span class='label label-locked'>locked</span>
@endif
@if(!$thread->isVisible())
			<span class='label label-hidden'>hidden</span>
@endif
@if($thread->isPoll())
			<span class='label label-poll'>poll</span>
@endif
			<a href='/forums/thread/{{\String::slugEncode($thread->id, $thread->title)}}' title='{{$thread->title}}'>
				{{$thread->title}}
			</a>
			<br />
			Started by {!!\Link::name($thread->author_id)!!}, {{\Time::shortReadable($thread->created_at)}}
@foreach(json_decode($thread->tags) as $tag)
			<a href='/forums/tag/{{$tag}}' class='label label-rt' title='{{$tag}}'>{{$tag}}</a>
@endforeach
		</div>
		<div class='pull-right'>
@if(!empty($thread->modControls))
			<div class='btn-group btn-group-dark'>
				<button type='button' class='btn'>Mod</button>
				<button type='button' class='btn dropdown-toggle' data-toggle='dropdown'>
					<span class='caret'></span>
					<span class='sr-only'>Toggle Dropdown</span>
				</button>
				<ul class='dropdown-menu' role='menu'>
					<li>
						<a href='/staff/moderation/thread/{{\String::slugEncode($thread->id, $thread->title)}}/title'>
							Edit Title
						</a>
					</li>
					<li>
						<a href='/staff/moderation/thread/{{\String::slugEncode($thread->id, $thread->title)}}/status={{$thread->modControls->pin}}'>
							Switch Pin
						</a>
					</li>
					<li>
						<a href='/staff/moderation/thread/{{\String::slugEncode($thread->id, $thread->title)}}/status={{$thread->modControls->lock}}'>
							Switch Lock
						</a>
					</li>
					<li>
						<a href='/staff/moderation/thread/{{\String::slugEncode($thread->id, $thread->title)}}/status={{$thread->modControls->hidden}}'>
							Switch Visibility
						</a>
					</li>
				</ul>
			</div>
@endif
		</div>
		<div class='clearfix'></div>
	</div>
	<div class='col-xs-12 col-sm-6 col-md-1'>
		{{$thread->posts_count-1}} posts
		<br />
		{{$thread->views_count}} views
	</div>
	<div class='col-xs-12 col-sm-10 col-md-3'>
@if($thread->last_post > 0)
		{!!\Link::name($thread->last_post_info->author_id)!!}
		<br />
		{{\Time::shortReadable($thread->last_post_info->created_at)}}
@endif
	</div>
</div>