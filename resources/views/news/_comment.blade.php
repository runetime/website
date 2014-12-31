<div class='news-comment clearfix'>
    {!! \Image::userPhoto($post->author->id, ['pull-left', 'photo-sm']) !!}
    <div>
        {!! $post->contents_parsed !!}
        <span>
            by <a href='{{ $post->author->toSlug() }}'>{{ $post->author->display_name }}</a> {{ \Time::shortReadable($post->created_at) }}
        </span>
    </div>
</div>
<br />