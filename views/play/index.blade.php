@extends('layouts.default')
@section('contents')
			<div class='wrapper wrapper-flat'>
				<h1>
					@lang('play.index.play_runescape')
				</h1>
				<div class='row row-flat'>
					<div class='col-xs-12 col-sm-6'>
						<a href='/play/3'>
							<img src='/img/play/rs3.png' class='img-responsive center-block' />
						</a>
					</div>
					<div class='col-xs-12 col-sm-6'>
						<a href='/play/osrs'>
							<img src='/img/play/osrs.png' class='img-responsive center-block' />
						</a>
					</div>
				</div>
			</div>
@stop