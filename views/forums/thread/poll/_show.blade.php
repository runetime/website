<div class='poll'>
    @foreach($poll['questions'] as $question)
        @include('forums.thread.poll._question', ['question' => $question])
    @endforeach
</div>