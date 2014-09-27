<?php
return [
	'driver'  =>'eloquent',
	'model'   =>'\Runis\Accounts\User',
	'table'   =>'users',
	'reminder'=>[
		'email' => 'emails.auth.reminder',
		'table' => 'password_reminders',
		'expire'=> 60,
	],
];