@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					@lang('donate.title')
				</h1>
				<h2>
					@lang('donate.help')
				</h2>
				<p class='lead'>
					@lang('donate.pledge')
				</p>
				<form action='https://paypal.com/cgi-bin/webscr' method='post'>
					<input type='hidden' name='bm' value='Serif.WebPlus' />
					<input type='hidden' name='cmd' value='donations' />
					<input type='hidden' name='business' value='bloom_m@yahoo.com' />
					<input type='hidden' name='item_name' value='@lang('donate.donation.item_name')' />
					<input type='hidden' name='currency_code' value='USd' />
					<input type='hidden' name='no_shipping' value='1' />
					<input type='hidden' name='cn' value="@lang('donate.donation.cn')" />
					<input type='hidden' name='no_note' value='0' />
					<button type='submit' class='center-block'>
						<img src='/img/donate/paypal.png' alt='Donate' class='img-responsive img-rounded' />
					</button>
				</form>
				<p>
					@lang('donate.note')
				</p>
				<p class='lead'>
					@lang('donate.thanks')
				</p>
				<p class='lead members-administrator'>
					Woofy - @lang('donate.head')
				</p>
			</div>
@stop