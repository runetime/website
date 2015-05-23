<div class='card card-{{ $ticket->readableStatus() }} row'>
    <div class='col-xs-12 col-sm-8'>
        <div class='pull-left'>
            <a href='/tickets/{{ \String::slugEncode($ticket->id, $ticket->name) }}'>
                {{$ticket->name}}
            </a>
            <br />
            @lang('utilities.started_by', ['author' => \Link::name($ticket->author->id)]), {{ \Time::shortReadable($ticket->created_at) }}
        </div>
        <div class='pull-right'>
@if(\Auth::user()->isStaff())
            <div class='btn-group btn-group-dark'>
                <button type='button' class='btn'>@lang('forums.statuses.create.status')</button>
                <button type='button' class='btn dropdown-toggle' data-toggle='dropdown'>
                    <span class='caret'></span>
                    <span class='sr-only'>@lang('forums.thread.mod.toggle')</span>
                </button>
                <ul class='dropdown-menu' role='menu'>
    @if($ticket->status !== 0)
                    <li>
                        <a href='/tickets/{{ \String::slugEncode($ticket->id, $ticket->name) }}/status/switch=0'>
                            @lang('utilities.open')
                        </a>
                    </li>
    @endif
    @if($ticket->status !== 1)
                    <li>
                        <a href='/tickets/{{ \String::slugEncode($ticket->id, $ticket->name) }}/status/switch=1'>
                            @lang('utilities.close')
                        </a>
                    </li>
    @endif
    @if($ticket->status !== 2)
                    <li>
                        <a href='/tickets/{{ \String::slugEncode($ticket->id, $ticket->name) }}/status/switch=2'>
                            @lang('tickets.escalate')
                        </a>
                    </li>
    @endif
                </ul>
            </div>
@endif
        </div>
        <div class='cleafix'></div>
    </div>
    <div class='col-xs-12 col-sm-1'>
        <p>
            @lang('utilities.posts_amount', ['amount' => $ticket->posts_count])
        </p>
    </div>
    <div class='col-xs-12 col-sm-3'>
        {!! \Link::name($ticket->lastPost()->author->id) !!}
        <br />
        {{ \Time::shortReadable($ticket->lastPost()->created_at) }}
    </div>
</div>
