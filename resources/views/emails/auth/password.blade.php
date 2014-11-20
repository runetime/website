<!DOCTYPE html>
<html lang="en-US">
	<head>
		<meta charset="utf-8">
	</head>
	<body>
		<h2>Password Reset</h2>

		<div>
			To reset your password, complete this form: <a href='http://178.62.54.243/password/reset/{{ $token }}'>http://178.62.54.243/password/reset/{{ $token }}</a><br/>

			This link will expire in {{ config('auth.reminder.expire', 60) }} minutes.
		</div>
	</body>
</html>
