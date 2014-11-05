@extends('layouts.default')
@section('contents')
			<div class='wrapper'>
				<h1>
					Donate
				</h1>
				<h2>
					Want to help-out RuneTime?
				</h2>
				<p class='lead'>
					We have pledged to remain Ad-free and keep those annoying (and often inappropriate!) Ads out of here! But of course we still have to pay the bills! So, any donations from our Amazing Members will be very much appreciated. If you want to donate, and have a PayPal account, then please just click the button below:
				</p>
				<form action='https://paypal.com/cgi-bin/webscr' method='post'>
					<input type='hidden' name='bm' value='Serif.WebPlus' />
					<input type='hidden' name='cmd' value='donations' />
					<input type='hidden' name='business' value='bloom_m@yahoo.com' />
					<input type='hidden' name='item_name' value='RuneTime Donation' />
					<input type='hidden' name='currency_code' value='USd' />
					<input type='hidden' name='no_shipping' value='1' />
					<input type='hidden' name='cn' value="What's your RuneTime user name?" />
					<input type='hidden' name='no_note' value='0' />
					<button type='submit' class='center-block'>
						<img src='img/donate/paypal.png' alt='Donate' class='img-responsive img-rounded' />
					</button>
				</form>
				<p>
					And unlike some websites, every penny we receive will <span class='text-uppercase'>only</span> be used to fund this website. Any spare money will be used to pay for Bond Give-Away's, other prizes, or donated to Charity. The staff and owners of RuneTime will not receive a penny! For us, it’s all about the Community. For reasons of transparency, each month we will post a detailed account of any money received and exactly where it was spent. There will be no secrets here! So, if you can and want to help us out, then please click the "Donate" button above.
				</p>
				<p class='lead'>
					Many Thanks,
				</p>
				<p class='lead members-administrator'>
					Woofy - Head of RuneTime
				</p>
			</div>
@stop