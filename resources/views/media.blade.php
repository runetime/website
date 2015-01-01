@extends('layouts.default')
@section('contents')
			<div class='container container-darkblue'>
				<h3>
					@lang('media.facebook.name')
				</h3>
				<iframe src='http://www.facebook.com/plugins/likebox.php?href=http%3A%2F%2Fwww.facebook.com%2FRuneTimeOfficial&width=292
&colorscheme=dark&connections=10&stream=true&header=true' scrolling='yes' frameborder='0' style='border:none; overflow:hidden;width:292px;height:571px;' allowTransparency='true'>
				</iframe>
			</div>
			<div class='container container-red'>
				<h3>
					@lang('media.youtube.name')
					<small>
						@lang('media.youtube.promotion')
					</small>
					<div class='embed-responsive embed-responsive-16by9'>
						<iframe allowfullscreen class='embed-responsive-item' height='315' frameborder='0' src='//www.youtube.com/embed/videoseries?list=UUdQ6FGjcwwvg-67g-lGa15Q' width='560'>
						</iframe>
					</div>
				</h3>
			</div>
			<div class='container container-lightgreen'>
				<h3>
					@lang('media.twitter.name')
				</h3>
				<a href='https://twitter.com/Rune_Time' class='twitter-timeline' data-widget-id='428962763814096896'>
					@lang('media.twitter.promotion')
				</a>
			</div>
			<script>
				!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','twitter-wjs');
			</script>
@stop