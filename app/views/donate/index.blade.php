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
				{{Form::open(['url'=>'https://www.paypal.com/cgi-bin/webscr','method'=>'post'])}} 
					{{Form::hidden('bm','Serif.WebPlus')}} 
					{{Form::hidden('cmd','_donations')}} 
					{{Form::hidden('business','bloom_m@yahoo.com')}} 
					{{Form::hidden('item_name','RuneTime Donation')}} 
					{{Form::hidden('currency_code','USD')}} 
					{{Form::hidden('no_shipping','1')}} 
					{{Form::hidden('cn',"What's your RuneTime user name?")}} 
					{{Form::hidden('no_note','0')}} 
					<button type='submit' class='center-block'>
						{{HTML::image('img/donate/paypal.png','Donate',['class'=>'img-responsive img-rounded'])}} 
					</button>
				{{Form::close()}} 
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