<?php
return array(
	'thread' => [
		'create' => [
			'name'  => 'Creating a New Thread in :subforum',
			'title' => [
				'name' => 'Title',
			],
			'poll' => [
				'name'     => 'Poll',
				'summary'  => 'Click here if you would like to create a poll.',
				'title'    => 'Poll Title',
				'question' => 'Question',
				'answer'    => 'Answer',
			],
			'tags' => [
				'name'        => 'Tags',
				'placeholder' => 'runescape, event',
				'help'        => 'If you use tags separate all tags by a comma.',
			],
			'post' => [
				'name' => 'Post',
			],
			'submit' => [
				'name' => 'Post Thread',
			],
		],
	],
	'post' => [
		'show' => [
			'ip' => 'IP: :ipAddress',
			'bar' => [
				'edit'   => 'Edit',
				'hide'   => 'Hide',
				'unhide' => 'Unhide',
				'delete' => 'Delete',
				'quote'  => 'Quote',
			],
		],
		'create' => [
			'submit' => 'Post',
		],
		'auth'   => 'You must be logged in to post.',
		'locked' => 'This thread is locked.',
	],
	'sidebar' => [
		'recent_threads' => [
			'name' => 'Recent Threads',
		],
		'recent_posts' => [
			'name' => 'Recent Posts',
		],
	],
	'bar' => [
		'total_posts'   => 'total posts',
		'total_members' => 'total members',
		'most_online'   => 'most online',
	],
	'top_posters' => [
		'today'   => "Today's Top Posters",
		'overall' => "Overall Top Posters",
	],
	'online' => [
		'current' => ':amount users are online',
		'in_time' => 'in the past :amount minutes',
	],
	'posts'   => ':amount posts',
	'threads' => ':amount threads',
	'by'      => 'by', // 'Thread name' by 'author' for example
);