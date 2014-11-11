<?php
if(!isset($button)) $button = 'Post';
if(!isset($url))    $url='/forums/reply';
?>
<form action='{{ $url }}' class='reply' method='post'>
	<div class='row'>
		<div class='hidden-xs col-sm-3 col-md-2 col-lg-1'>
			{!! \Image::userPhoto(\Auth::user()->id, ['img-rounded']) !!}
		</div>
		<div class='col-xs-12 col-sm-9 col-md-10 col-lg-11'>
			<textarea name='contents' id='contents' rows='15' class='form-control'></textarea>
			<p>
				<ul class='list-inline'>
					<li>
						<button class='btn btn-primary' type='submit'>
							{{ $button }}
						</button>
					</li>
					<li>
						<a href='/transparency/markdown' target='_blank' class='btn btn-sm btn-info'>
							Markdown
						</a>
					</li>
				</ul>
			</p>
		</div>
	</div>
</form>