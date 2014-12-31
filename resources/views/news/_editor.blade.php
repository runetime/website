<div class='news-editor' rt-data='{{ $news->id }}'>
    <textarea id='news-comment-textarea' rows='3'></textarea>
    <button type='submit' class='btn btn-primary' rt-hook='news.article:comment.submit'>
        Comment
    </button>
</div>