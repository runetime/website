<?php
return [
	'title'   => 'Staff',
	'checkup' => [
		'title' => 'Staff Checkup',
		'team'  => [
			'content' => 'Content',
			'community'   => 'Community',
			'development' => 'Development',
			'graphics'    => 'Graphics',
			'radio'       => 'Radio',
		],
	],
	'index' => [
		'title' => 'Staff Panel',
		'wip' => 'Still a work in progress, unfortunately.  Not sure what to put here.',
	],
	'list' => [
		'title' => 'Staff List',
	],
	'moderation' => [
		'name'    => 'Moderation Panel',
		'reports' => [
			'closed_reports' => 'Closed Reports',
			'open_reports'   => 'Open Reports',
			'reported_at'    => 'Reported at :date',
			'reported_desc'  => 'User reported the post located in thread',
			'status' => [
				'closed' => 'closed',
				'open'   => 'open',
			],
			'view' => [
				'currently'    => 'The report is currently <b>:status</b>.',
				'submitted_on' => 'Submitted on :date',
				'viewing'      => 'Viewing Report by :name',
			],
		],
		'subforum' => [
			'edit_title' => 'Edit Title',
			'hide'       => 'Hide',
			'lock'       => 'Lock',
			'pin'        => 'Pin',
			'unhide'     => 'Unhide',
			'unlock'     => 'Unlock',
			'unpin'      => 'Unpin',
		],
	],
	'radio' => [
		'title' => 'Radio Panel',
		'index' => [
			'currently_live' => [
				'title'      => 'Currently Live',
				'current'    => ':name is currently live.',
				'go_live'    => 'Go Live',
				'live_panel' => 'Live Panel',
				'no_one'     => 'No one is currently live.',
				'stop'       => 'Stop DJing',
				'you'        => 'You are currently live.',
			],
			'your_messages' => [
				'title'  => 'Your Messages',
				'update' => 'Update Messages',
			],
			'timetable'  => [
				'title'  => 'Timetable',
				'update' => 'Update Timetable',
			],
		],
		'live' => [
			'title'           => 'Radio Live Center',
			'current_song'    => 'Current Song',
			'current_message' => 'Current Message',
			'messages'        => 'Messages',
			'requests'        => 'Requests',
		],
		'messages' => [
			'title'   => 'Radio Messages',
			'create'  => 'Create Message',
			'current' => 'Current Messages',
		],
		'timetable' => [
			'title' => 'Radio Timetable',
		],
	],
];