<p>
	{{ $name }},
</p>
<p>
	This email has been sent from <a href='http://runetime.com/'>RuneTime</a>.
</p>
<br />
<p>
	You have received this email because this email address was used during registration for our website. If you did not register at our website, please disregard this email. You do not need to unsubscribe or take any further action.
</p>
<br />
<h2>
	Activation Instructions
</h2>
<p>
	Thank you for registering.
</p>
<p>
	Your account has already been activated and does not need to be activated via email.
</p>
<br />

<h2>
    Not Working?
</h2>
<p>
    Here are your non-sensitive account details:
</p>
<p>
    <b>Username</b>: {{ $name }}
</p>
<p>
    <b>User ID</b>: {{ $id }}
</p>
<br />

<p>
    If you still cannot validate your account, it's possible that the account has been removed or you need to reset your password.  To reset your password, please use <a href='{{ url('password/reset') }}'>the password reset form</a>.
</p>
<br />
<p>
    Thank you for registering and enjoy your stay!
</p>