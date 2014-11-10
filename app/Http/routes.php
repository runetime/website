<?php
# About
get('about', 'AboutController@getIndex');

/**
 * Auth
 */
Route::group([], function() {
	/**
	 * Logged in
	 */
	Route::group(['before' => 'Authenticated'], function() {
		get('logout', 'AuthController@getLogout');
	});

	/**
	 * Not logged in
	 */
	Route::group(['before' => 'IsGuest'], function() {
		get('login', 'AuthController@getLoginForm');
		post('login', 'AuthController@postLoginForm');
		get('signup', 'AuthController@getSignupForm');
		post('signup', 'AuthController@postSignupForm');
	});
});

/**
 * Awards
 */
Route::group(['prefix' => 'awards'], function() {
	get('/', 'AwardController@getIndex');
	get('{slug}', 'AwardsController@getView');
});

/**
 * Calculators
 */
Route::group(['prefix' => 'calculators'], function() {
	get('/', 'CalculatorController@getIndex');
	get('{type}', 'CalculatorController@getView');
	post('load', 'CalculatorController@postLoad');
});

/**
 * Calendars
 */
Route::group(['prefix' => 'calendars'], function() {
	get('/', 'CalendarController@getIndex');
});

/**
 * Chat
 */
Route::group(['prefix' => 'chat'], function() {
	post('update', 'ChatController@postUpdate');
	post('start', 'ChatController@postStart');
	get('channels', 'ChatController@getChannels');
	post('channels/check', 'ChatController@postCheckChannel');
	/**
	 * Only logged in can perform
	 */
	Route::group(['before' => 'Authenticated'], function() {
		post('post/message', 'ChatController@postMessage');
	});
	/**
	 * Only moderators can perform
	 */
	Route::group(['before' => 'IsModerator'], function() {
		post('post/status/change', 'ChatController@postStatusChange');
	});
});

# Donate
get('donate', 'DonateController@getIndex');

/**
 * Forums
 */
Route::group(['prefix' => 'forums'], function() {
	get('/', 'ForumController@getIndex');
	get('{id}-{name}', 'ForumController@getSubforum');
	/**
	 * Thread
	 */
	Route::group(['prefix' => 'thread/{id}-{name}'], function() {
		get('/', 'ForumController@getThread');
		get('{page}', 'ForumController@getThread');
	});
	/**
	 * Create Thread
	 */
	Route::group(['prefix' => 'create/{id}-{name}'], function() {
		get('/', 'ForumController@getThreadCreate');
		post('/', 'ForumController@postThreadCreate');
	});
});

# Home
get('/', 'HomeController@getIndex');
get('home', 'HomeController@getIndex');

/**
 * Language
 */
Route::group(['prefix' => 'language'], function() {
	/**
	 * Set The User's Language
	 */
	Route::group(['prefix' => 'set'], function() {
		get('/', 'LanguageController@getSet');
		get('{initials}', 'LanguageController@getChange');
	});
});
/**
 * Legal
 */
Route::group([], function() {
	get('privacy', 'LegalController@getPrivacy');
	get('terms', 'LegalController@getTerms');
});

/**
 * Livestream
 */
Route::group(['prefix' => 'livestream'], function() {
	get('/', 'LivestreamController@getIndex');
	get('reset', 'LivestreamController@getReset');
});
/**
 * Maps
 */
Route::group(['prefix' => 'map'], function() {
	get('/', 'MapController@getIndex');
	get('members', 'MapController@getMembers');
	Route::group(['prefix' => 'runescape'], function() {
		get('/', 'MapController@getRunescape');
		get('3', 'MapController@getRS3');
		get('old-school', 'MapController@getOS');
	});
});

/**
 * Media
 */
get('media', 'MediaController@getIndex');

/**
 * Messenger
 */
Route::group(['middleware' => 'auth', 'prefix' => 'messenger'], function() {
	get('/', 'MessengerController@getIndex');
	get('{id}-{name}', 'MessengerController@getView');
	/**
	 * Compose
	 */
	Route::group(['prefix' => 'compose'], function() {
		get('/', 'MessengerController@getCreate');
		get('to={id}-{name}', 'MessengerController@getCreate');
		post('/', 'MessengerController@postCreate');
	});
});

/**
 * Name Checker
 */
Route::group(['prefix' => 'name/check'], function() {
	get('/', 'UtilityController@getNameCheck');
	post('/', 'UtilityController@postNameCheck');
});

Route::group(['prefix' => 'play'], function() {
	get('/', 'PlayController@getIndex');
	get('3', 'PlayController@get3');
	get('osrs', 'PlayController@getOSRS');
});

/**
 * Radio
 */
Route::group(['prefix' => 'radio'], function() {
	get('/', 'RadioController@getIndex');
	get('request/history', 'RadioController@getHistory');
	get('request/timetable', 'RadioController@getTimetable');
	get('request/song', 'RadioController@getSong');
	get('update', 'RadioController@getUpdate');
	Route::group(['before' => 'Authenticated'], function() {
		get('send/request/{artist}/{name}', 'RadioController@getSendRequest');
	});
});

/**
 * Staff
 */
Route::group(['prefix' => 'staff'], function() {
	/**
	 * Anyone can access
	 */
	Route::group([], function() {
		get('list', 'StaffController@getList');
	});
	/**
	 * Only staff can access
	 */
	Route::group(['before' => 'IsStaff'], function() {
		get('/', 'StaffController@getIndex');
		/**
		 * Moderation Panel
		 */
		Route::group(['prefix' => 'moderation'], function() {
			get('/', 'StaffController@getModerationIndex');
			get('report/{id}', 'StaffController@getModerationReportView');
			/**
			 * Thread Management
			 */
			Route::group(['prefix' => 'thread/{id}-{name}'], function() {
				get('status={status}', 'StaffController@getModerationThreadStatus');
				get('title', 'StaffController@getModerationThreadTitle');
				post('title', 'StaffController@postModerationThreadTitle');
			});
		});
	});
});