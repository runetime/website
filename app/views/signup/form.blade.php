			<div class='wrapper'>
				<form class='form-horizontal' method='post' action='' role='form'>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='username'>
							Username
						</label>
						<div class='col-lg-10'>
							<input id='username' class='form-control' type='text' name='username' placeholder='Username' required='' />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='email'>
							Email Address
						</label>
						<div class='col-lg-10'>
							<input id='email' class='form-control' type='email' name='email' placeholder='Email Address' required='' />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='password'>
							Password
						</label>
						<div class='col-lg-10'>
							<input id='password' class='form-control' type='password' name='password' placeholder='Password' required='' />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='message'>
							Confirm Password
						</label>
						<div class='col-lg-10'>
							<input id='password2' class='form-control' type='password' name='password2' placeholder='Password Confirmation' required='' />
						</div>
					</div>
					<div class='form-group'>
						<label class='col-lg-2 control-label' for='security'>
							Security Check
						</label>
						<div class='col-lg-10'>
							<input id='security' type='range' min='0' max='100' step='1' value='50' />
							<p class='help-block'>
								Move the slider all the way to the left.
							</p>
						</div>
					</div>
					<div class='form-group'>
						<div class='col-lg-offset-2 col-lg-10'>
							<button class='btn btn-primary' type='submit' disabled>
								Create Account
							</button>
							<p class='text-danger'>
								Please fill out the Security Check.
							</p>
						</div>
					</div>
				</form>
			</div>