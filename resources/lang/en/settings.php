<?php
return [
	'name' => 'Settings',
	'nav' => [
		'profile_settings'   => 'Profile Settings',
		'photo'              => 'Photo',
		'password' => 'Password',
		'about_me'           => 'About Me',
		'signature'          => 'Signature',
		'social'             => 'Social',
		'runescape'          => 'RuneScape',
	],
	'profile' => [
		'timezone' => [
			'name'  => 'Timezone',
			'hours' => 'hours',
			'dst'   => 'Automatically detect DST',
		],
		'comments_visitors' => [
			'name' => 'Comments & Visitors',
			'help' => 'Show last 5 visitors',
		],
		'friends' => [
			'name' => 'Friends',
			'help' => 'Show my friends in my profile',
		],
		'birthday' => [
			'name' => 'Birthday',
			'months' => [
				1  => 'January',
				2  => 'February',
				3  => 'March',
				4  => 'Apil',
				5  => 'May',
				6  => 'June',
				7  => 'July',
				8  => 'August',
				9  => 'September',
				10 => 'October',
				11 => 'November',
				12 => 'December',
			],
			'note' => 'Entering your birthday is optional.',
		],
		'gender'            => 'Gender',
		'location'          => 'Location',
		'interests'         => 'Interests',
		'referred_by'       => [
			'name' => 'Referred By',
			'note' => 'Did someone tell you about us?  Tell us who told you!',
		],
	],
	'photo' => [
		'current' => 'Current Photo',
		'change'  => 'Change Photo',
	],
	'password' => [
		'note'        => 'We will attempt to log you in with your new password.  If there are difficulties please logout and try again with your new password.',
		'current'     => 'Current Password',
		'new'         => 'New Password',
		'confirm_new' => 'Confirm New Password',
	],
	'about' => [
		'current' => 'Current About Me',
		'edit'    => 'Edit About Me',
	],
	'signature' => [
		'current' => 'Current Signature',
		'edit'    => 'Edit Signature',
	],
	'social' => [
		'edit' => 'Edit Social Information',
	],
	'runescape' => [
		'edit' => 'Edit RuneScape Information',
	],
	'save_changes' => 'Save Changes',
];