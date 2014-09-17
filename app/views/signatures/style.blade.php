			<div class='wrapper'>
<?php $x=0;?>
@foreach($imgs as $img)
	@if($x==0)
				<div class='row'>
	@endif
					<div class='col-xs-12 col-sm-6 col-md-3'>
						<a href='/signatures/username={{$username}}/type={{$type}}/style={{str_replace('.png','',$img)}}'>
							<img src='/img/signatures/backgrounds/{{$img}}' />
						</a>
					</div>
<?php $x++;?>
	@if($x==4)
<?php $x=0;?>
				</div>
	@endif
@endforeach
			</div>