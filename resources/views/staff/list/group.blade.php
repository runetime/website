				<div class='row'>
@foreach($staff as $key=>$member)
					<div class='row-col-xs-12 col-sm-4 col-md-3 col-xs-6'>
						@include('card',['member'=>$member])
					</div>
@endforeach
				</div>