@extends('layouts.app')
@section('app')
@if(isset($displayPageHeader) && $displayPageHeader && isset($title))
		<div class='wrapper wrapper-flat'>
			<ol class='breadcrumb'>
				<li data-toggle='tooltip' data-placement='bottom' title='Home'>
					<a href='/'>
						@lang('navbar.home')
					</a>
				</li>
	@foreach($bc as $url => $name)
		@if(String::startsWith('#', $url))
				<li class='active' data-toggle='tooltip' data-placement='bottom' title='{{ $name }}'>
					<span>
						{{ $name }}
					</span>
				</li>
		@else
				<li>
					<a href='{{ $url }}' data-toggle='tooltip' data-placement='bottom' title='{{ $name }}'>
						{{ $name }}
					</a>
				</li>
		@endif
	@endforeach
				<li class='active'>
					<span data-toggle='tooltip' data-placement='bottom' title='{{ $title }}'>
						{{ $title }}
					</span>
				</li>
			</ol>
		</div>
@endif
		<div id='page'>
@yield('contents')
		</div>
		<div id='portfolio' class='row wrapper-dark'>
			<div class='col-xs-12 col-md-6'>
				<p class='holo-text holo-line-block'>
					@lang('footer.about_us')
				</p>
				<div id='portfolio-about'>
					<p>
						<a href='/privacy' title='@lang('footer.privacy')'>@lang('footer.privacy')</a> &mdash; <a href='/terms' title='@lang('footer.terms')'>@lang('footer.terms')</a> &mdash; <a href='/contact' title='@lang('footer.contact')'>@lang('footer.contact')</a>
					</p>
					<p>
						<a href='http://runescape.com/community' title='Runescape'>Runescape</a>&reg; @lang('footer.and') <a href='http://jagex.com/' title='Jagex'>Jagex</a>&reg; @lang('footer.trademarks') Jagex Ltd &copy; 1999-{{ date('Y') }}
					</p>
					<p>
						@lang('footer.images')
					</p>
					<p>
						@lang('footer.affiliated')
					</p>
				</div>
			</div>
			<div class='col-xs-12 col-md-6'>
				<p class='holo-text holo-line-block'>
					@lang('footer.follow_us')
				</p>
				<div id='portfolio-social'>
					<a href='https://www.facebook.com/RuneTimeOfficial' title='@lang('footer.facebook')'>
						<img src='/img/fb.png' alt='Facebook' />
					</a>
					<a href='https://twitter.com/Rune_Time' title='@lang('footer.twitter')'>
						<img src='/img/tw.png' alt='Twitter' />
					</a>
					<a href='https://www.youtube.com/user/RuneTimeOfficial' title='@lang('footer.youtube')'>
						<img src='/img/yt.png' alt='YouTube' />
					</a>
				</div>
			</div>
			<p class='pull-right'>
				<a href='/language/set' data-toggle='tooltip' data-placement='top' title='@lang('footer.language')'>
					<i class='text-info fa fa-language'></i>
				</a>
			</p>
		</div>
		<div id='top' class='hidden-xs'>
			<a data-toggle='tooltip' data-placement='top' title='Back to Top'>
				<i class='fa fa-chevron-up'></i>
			</a>
		</div>
		<div id='loading'></div>
@stop