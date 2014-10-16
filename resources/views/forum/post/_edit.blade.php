<?php
if(!isset($button)) $button = 'Post';
if(!isset($url))    $url='/forums/reply';
?>
<form action='{{$url}}' class='reply' method='post'>
    <input type='hidden' name='id' value='{{$id}}' />
    <div class='row'>
        <div class='hidden-xs col-sm-3 col-md-2 col-lg-1'>
            {!!\Image::userPhoto(\Auth::user()->id, ['img-rounded'])!!}
        </div>
        <div class='col-xs-12 col-sm-9 col-md-10 col-lg-11'>
            <textarea name='contents' id='contents' rows='5' title='Post'></textarea>
            <p>
                <button class='btn btn-primary' type='submit'>
                    {{$button}}
                </button>
            </p>
        </div>
    </div>
</form>