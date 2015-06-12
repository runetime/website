@if($thread->isRead())
    @if($thread->isPinned())
<div class='card card-pinned row'>
    @elseif($thread->isLocked())
<div class='card card-locked row'>
    @elseif(!$thread->isVisible())
<div class='card card-hidden row'>
    @elseif($thread->isPoll())
<div class='card card-poll row'>
    @else
<div class='card card-read row'>
    @endif
@else
<div class='card card-unread row'>
@endif
    <div class='col-xs-12 col-sm-6 col-md-7'>
        <div class='pull-left'>
@if($thread->isPinned())
            <span class='label label-pinned'>@lang('forums.thread.label.pinned')</span>
@endif
@if($thread->isLocked())
            <span class='label label-locked'>@lang('forums.thread.label.locked')</span>
@endif
@if(!$thread->isVisible())
            <span class='label label-hidden'>@lang('forums.thread.label.hidden')</span>
@endif
@if($thread->isPoll())
            <span class='label label-poll'>@lang('forums.thread.label.poll')</span>
@endif
            <a href='/forums/thread/{{ \String::slugEncode($thread->id, $thread->title) }}' title='{{ $thread->title }}'>
                {{ $thread->title }}
            </a>
            <br />
            @lang('forums.thread.started_by', ['author' => \Link::name($thread->author_id)]), {{ \Time::shortReadable($thread->created_at) }}
@foreach($thread->tags as $tag)
            <a href='/forums/tag/{{ $tag->name }}' class='label label-rt' title='{{ $tag->name }}'>{{ $tag->name }}</a>
@endforeach
        </div>
        <div class='pull-right'>
@if(\Auth::check() && \Auth::user()->isCommunity())
            <div class='btn-group btn-group-dark'>
                <button type='button' class='btn'>
                    @lang('forums.thread.mod.title')
                </button>
                <button type='button' class='btn dropdown-toggle' data-toggle='dropdown'>
                    <span class='caret'></span>
                    <span class='sr-only'>@lang('forums.threads.mod.toggle')</span>
                </button>
                <ul class='dropdown-menu' role='menu'>
                    <li>
                        <a href='/staff/moderation/thread/{{ \String::slugEncode($thread->id, $thread->title) }}/title'>
                            @lang('forums.thread.mod.edit_title')
                        </a>
                    </li>
                    <li>
                        <a href='/staff/moderation/thread/{{ \String::slugEncode($thread->id, $thread->title) }}/status={{ $thread->getStatusPinSwitch() }}'>
                            @lang('forums.thread.mod.switch_pin')
                        </a>
                    </li>
                    <li>
                        <a href='/staff/moderation/thread/{{ \String::slugEncode($thread->id, $thread->title) }}/status={{ $thread->getStatusLockSwitch() }}'>
                            @lang('forums.thread.mod.switch_lock')
                        </a>
                    </li>
                    <li>
                        <a href='/staff/moderation/thread/{{ \String::slugEncode($thread->id, $thread->title) }}/status={{ $thread->getStatusHiddenSwitch() }}'>
                            @lang('forums.thread.mod.switch_visibility')
                        </a>
                    </li>
                </ul>
            </div>
@endif
        </div>
        <div class='clearfix'></div>
    </div>
    <div class='col-xs-12 col-sm-6 col-md-2'>
        @lang('forums.posts', ['amount' => $thread->posts_count])
        <br />
        @lang('utilities.views', ['amount' => $thread->views_count])
    </div>
    <div class='col-xs-12 col-sm-10 col-md-3'>
@if($thread->last_post > 0)
        {!! \Link::name($thread->lastPost()->author_id) !!}
        <br />
        {{ \Time::shortReadable($thread->lastPost()->created_at) }}
@endif
    </div>
</div>
