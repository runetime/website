@extends('layouts.default')
@section('contents')
			<div class='wrapper-dark'>
				<img src='/img/clan/header.png' class='img-responsive center-block' alt='RuneTime Clan' />
			</div>
			<div class='wrapper'>
				<h1>
					@lang('clan.title')
				</h1>
@for($i = 1; $i <= 5; $i++)
	@if(substr(trans('clan.p' . $i), 0, 7) === "HEADER:")
				<h2 class='text-info'>
					{!! str_replace("HEADER:", "", trans('clan.p' . $i)) !!}
				</h2>
	@else
				<p>
					@lang('clan.p' . $i)
				</p>
	@endif
@endfor
				<dl>
@for($i = 1; $i <= 10; $i++)
					<dt>
						@lang('clan.dt.l' . $i)
					</dt>
					<dd>
						@lang('clan.dd.l' . $i)
					</dd>
@endfor
				</dl>
			</div>
@stop