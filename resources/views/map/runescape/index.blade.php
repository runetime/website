@extends('......layouts.default')
@section('contents')
			<div class='wrapper'>
				<p>
					Please click the button below to see either the old-school map or the new up to date map.
				</p>
				<div class='row'>
					<div class='col-xs-12 col-sm-6'>
						<a href='/map/runescape/3' title='Runescape 3'>
							<img src='/img/map/rs3.png' alt='Runescape3' class='center-block img-responsive img-rounded' />
						</a>
					</div>
					<div class='col-xs-12 col-sm-6'>
						<a href='/map/runescape/old-school' title='Old School Runescape'>
							<img src='/img/map/osrs.png' alt='Old School Runescape' class='center-block img-responsive img-rounded' />
						</a>
					</div>
				</div>
			</div>
@stop