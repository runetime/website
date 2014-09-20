			<div id='radio' class='wrapper'>
				<div class='row'>
					{{HTML::image('img/radio/header.png','RuneTime Radio',['class'=>'img-responsive center-block'])}} 
				</div>
				<br />
				<div class='row'>
					<div id='radio-pull' class='col-xs-12 col-md-1 holo-box-dark invisible'>
						<button id='pull-close' type='button' class='close'>
							<span aria-hidden='true'>
								Close &times;
							</span>
						</button>
						<div id='pull-contents'>
							&nbsp;
						</div>
					</div>
					<div id='radio-options' class='col-xs-12 col-md-11 row holo-box-dark'>
						<div class='col-xs-12 col-md-4 text-center'>
							<h3 class='holo-text'>
								Radio Player
							</h3>
							<h4>
								<a id='radio-link' title='Click here'>Click here</a>
							</h4>
							<p id='radio-message'>
								to listen to RuneTime Radio!
							</p>
							<p>
								Status: <span id='radio-status' class='text-danger'><i id='power-button' class='fa fa-power-off'></i>Off</span>
						</div>
						<div class='col-xs-12 col-md-4 text-center'>
							<h3 class='holo-text'>
								Information
							</h3>
							<div class='row'>
								<div class='col-xs-12 col-md-6'>
									<h4>
										Current DJ:
									</h4>
									<p id='radio-dj' class='holo-text-secondary'>
										{{$dj}} 
									</p>
									<h4>
										Current Song
									</h4>
									<p>
										<span id='radio-song-name' class='holo-text-secondary'>{{$song['name']}}</span>
										by <span id='radio-song-artist' class='holo-text-secondary'>{{$song['artist']}}</span>
									</p>
								</div>
								<div class='col-xs-12 col-md-6'>
									<h4>
										Requests
									</h4>
									<div id='requests-user-current'>
									</div>
								</div>
							</div>
						</div>
						<div class='col-xs-12 col-md-4'>
							<p>
								<a id='radio-history' title='View the Song History'>
									Song History
								</a>
							</p>
							<p>
								<a id='radio-request' title='Request a Song From the DJ'>
									Request Song From DJ
								</a>
							</p>
							<p>
								<a id='radio-timetable' title='View the DJ Timetable'>
									DJ Timetable
								</a>
							</p>
@if($isDJ)
							<h3>
								DJ Controls
							</h3>
							<p>
								<a id='radio-dj-requests' title='View Requests'>
									View Requests
								</a>
							</p>
							<p>
								<a id='radio-dj-requests' title='Edit Timetable'>
									Edit Timetable
								</a>
							</p>
@endif
						</div>
						<div id='shoutbox-holder-radio' class='col-xs-12'>
						</div>
					</div>
					<div id='shoutbox-holder' class='col-xs-12 holo-box-dark'>
						<div id='shoutbox'>
							There's a bunch of
							<br />
							messages here
						</div>
					</div>
				</div>
			</div>