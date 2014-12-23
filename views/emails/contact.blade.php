<h1>
	Message Via Contact Form <small>runetime.net</small>
</h1>
<p>
	Sent from email <a href='mailto:{{ $email }}'>{{ $email }}</a>
</p>
@if(!empty($username))
<p>
    The user was logged in as <b>{{ $username }}</b>
</p>
@endif
<h3>
	Message:
</h3>
<p>
    <pre>{{ $contents }}</pre>
</p>