<h3>
    {{ $question['name'] }} <small>[{{ $question['votes'] }} votes]</small>
</h3>
<div class='answers row'>
@foreach($question['answers'] as $key2 => $answer)
    @include('forums.thread.poll._answer', ['answer' => $answer])
@endforeach
</div>