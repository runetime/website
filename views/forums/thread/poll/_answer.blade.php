<div class='col-xs-12'>
    <span>
        {{ $answer['contents'] }}
        <small>[{{ $answer['votes'] }}/{{ $question['votes'] }} votes]</small>
@if($answer['voted'] === true)
            <a class='fa fa-check text-success' rt-data='{!! $answer['json'] !!}' rt-hook='forum:poll.vote'></a>
@else
            <a class='fa fa-check text-danger' rt-data='{!! $answer['json'] !!}' rt-hook='forum:poll.vote'></a>
@endif
    </span>
    <div class='progress progress-bar-dark'>
        <div class='progress-bar' role='progressbar' area-valuenow='{{ $answer['percentage'] }}' area-valuemin='0' area-valuemax='100' style='width: {{ $answer['percentage'] }}%;'>
            {{ $answer['percentage'] }}%
            <small>[{{ $answer['votes'] }}/{{ $question['votes'] }} votes]</small>
        </div>
    </div>
</div>