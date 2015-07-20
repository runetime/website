@extends('layouts.default')
@section('contents')
<div class='row text-center'>
    <div id='media-fb' class='col-xs-12 col-md-4 container-royal-blue'>
        <h2 class='color-white'>
            @lang('media.facebook.name')
        </h2>
        <iframe src='http://www.facebook.com/plugins/likebox.php?href=http%3A%2F%2Fwww.facebook.com%2FRuneTimeOfficial&width=400
&colorscheme=dark&connections=10&stream=true&header=true' scrolling='yes' frameborder='0' style='border:none; overflow:hidden;width:400px;height:571px;' allowTransparency='true'>
        </iframe>
    </div>
    <div id='media-yt' class='col-xs-12 col-md-4 container-red'>
        <h2 class='color-white'>
            @lang('media.youtube.name')
        </h2>
        <p class='color-white'>
            @lang('media.youtube.promotion')
        </p>
        <div class='row'>
            <div class='col-xs-12'>
                <div class='embed-responsive embed-responsive-16by9'>
                    <iframe allowfullscreen class='embed-responsive-item' height='315px' frameborder='0' src='//www.youtube.com/embed/videoseries?list=UUdQ6FGjcwwvg-67g-lGa15Q' width='560px'>
                    </iframe>
                </div>
            </div>
        </div>
    </div>
    <div id='media-tw' class='col-xs-12 col-md-4 container-duckegg-blue'>
        <h2 class='color-white'>
            @lang('media.twitter.name')
        </h2>
        <a href='https://twitter.com/Rune_Time' class='twitter-timeline' data-widget-id='428962763814096896'>
            @lang('media.twitter.promotion')
        </a>
    </div>
</div>
<script>
    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','twitter-wjs');

    var h1 = $('#media-fb').height(),
        h2 = $('#media-yt').height(),
        h3 = $('#media-tw').height(),
        max = Math.max(h1, h2, h3),
        h = max + 'px';

    $('#media-fb').height(h);
    $('#media-yt').height(h);
    $('#media-tw').height(h);
</script>
@stop
