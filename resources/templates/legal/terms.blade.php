@if(!isset($include))
@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
@endif
				<h1>
					Terms of Use
				</h1>
				<p class='text-warning lead'>
					<b>NOTE: </b> @lang('legal.translation_notes.p1') <a href='/legal/english'>@lang('legal.translation_notes.p2')</a>
				</p>
@for($i = 1; $i <= 5; $i++)
	@if(substr(trans('legal.terms.p' . $i), 0, 7) === "HEADER:")
				<h2 class='text-info'>
					{!! str_replace("HEADER:", "", trans('legal.terms.p' . $i)) !!}
				</h2>
	@else
				<p>
					@lang('legal.terms.p' . $i)
				</p>
	@endif
@endfor
				<ul>
@for($i = 1; $i <= 8; $i++)
					<li>
						@lang('legal.terms.list1.l' . $i)
					</li>
@endfor
				</ul>
				<p>
					@lang('legal.terms.p6')
				</p>
				<ul>
@for($i = 1; $i <= 8; $i++)
					<li>
						@lang('legal.terms.list2.l' . $i)
					</li>
@endfor
				</ul>
				<p>
					@lang('legal.terms.p7') <a href='http://services.runescape.com/m=rswiki/en/Rules_of_RuneScape' target='_blank'>http://services.runescape.com/m=rswiki/en/Rules_of_RuneScape</a>.
				</p>
@if(!isset($include))
			</div>
@stop
@endif