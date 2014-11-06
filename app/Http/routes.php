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
	Route::group(['middleware' => 'auth'], function() {
		get('logout', 'AuthController@getLogout');
	});

	/**
	 * Not logged in
	 */
	Route::group(['middleware' => 'guest'], function() {
		/**
		 * Login
		 */
		Route::group(['prefix' => 'login'], function() {
			get('/', 'AuthController@getLoginForm');
			post('/', 'AuthController@postLoginForm');
		});
		/**
		 * Signup
		 */
		Route::group(['prefix' => 'signup'], function() {
			get('/', 'AuthController@getSignupForm');
			post('/', 'AuthController@postSignupForm');
		});
		/**
		 * Password Reset
		 */
		Route::group(['prefix' => 'password/reset'], function() {
			get('/', 'AuthController@getPasswordEmail');
			post('/', 'AuthController@postPasswordEmail');
			get('{token}', 'AuthController@getPasswordReset');
			post('{token}', 'AuthController@postPasswordReset');
		});
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
 * Calendar
 */
Route::group(['prefix' => 'calendar'], function() {
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
	Route::group(['middleware' => 'auth'], function() {
		post('post/message', 'ChatController@postMessage');
	});
	/**
	 * Only moderators can perform
	 */
	Route::group(['middleware' => 'staff.moderator'], function() {
		post('post/status/change', 'ChatController@postStatusChange');
	});
});

/**
 * Clan
 */
Route::group(['prefix' => 'clan'], function() {
	get('/', 'ClanController@getIndex');
});

/**
 * Databases
 */
Route::group(['prefix' => 'databases'], function() {
	get('/', 'DatabaseController@getIndex');
	/**
	 * Items
	 */
	Route::group(['prefix' => 'items'], function() {
		get('/', 'DatabaseController@getItemsIndex');
		get('membership={searchMembership}/tradable={searchTradable}/questItem={searchItem}', 'DatabaseController@getItemsIndex');
		get('{id}-{name}', 'DatabaseController@getItemsView');
		/**
		 * Create
		 */
		Route::group(['prefix' => 'create'], function() {
			get('/', 'DatabaseController@getItemsCreate');
			post('/', 'DatabaseController@postItemsCreate');
		});
	});

	/**
	 * Monsters
	 */
	Route::group(['prefix' => 'monsters'], function() {
		get('/', 'DatabaseController@getMonstersIndex');
		get('membership={searchMembership}', 'DatabaseController@getMonstersIndex');
		get('{id}-{name}', 'DatabaseController@getMonstersView');
		/**
		 * Create
		 */
		Route::group(['prefix' => 'create'], function() {
			get('/', 'DatabaseController@getMonstersCreate');
			post('/', 'DatabaseController@postMonstersCreate');
		});
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
		Route::group(['middleware' => 'auth'], function() {
			get('edit', 'ForumController@getThreadEdit');
		});
	});
	/**
	 * Create Thread
	 */
	Route::group(['prefix' => 'create/{id}-{name}'], function() {
		get('/', 'ForumController@getThreadCreate');
		post('/', 'ForumController@postThreadCreate');
	});
	post('reply', 'ForumController@postReply');
	get('tag/{name}', 'ForumController@getTagSearch');
	/**
	 * Posts
	 */
	Route::group(['middleware' => 'auth', 'prefix' => 'post/{id}'], function() {
		/**
		 * Reporting a post
		 */
		Route::group(['prefix' => 'report'], function() {
			get('/', 'ForumController@getPostReport');
			post('/', 'ForumController@postPostReport');
		});
		/**
		 * Editing a post
		 */
		Route::group(['prefix' => 'edit'], function() {
			get('/', 'ForumController@getPostEdit');
			post('/', 'ForumController@postPostEdit');
		});
		get('delete', 'ForumController@getPostDelete');
	});
});

/**
 * Get
 */
Route::group(['prefix' => 'get'], function() {
	post('signup/email', 'GetController@postEmail');
	post('signup/display_name', 'GetController@postDisplayName');
	get('hiscore/{rsn}', 'GetController@getHiscore');
	get('bbcode', 'GetController@getBBCode');
});

/**
 * Guides
 */
Route::group(['prefix' => 'guides'], function() {
	get('/', 'GuideController@getIndex');
	/**
	 * Quests
	 */
	Route::group(['prefix' => 'quests'], function() {
		get('/', 'GuideController@getQuests');
		get('difficulty={searchDifficulty}/length={searchLength}/membership={searchMembership}', 'GuideController@getQuests');
		get('{id}-{name}', 'GuideController@getQuestView');
		/**
		 * Create Quest Guide
		 */
		Route::group(['prefix' => 'create'], function() {
			get('/', 'GuideController@getQuestCreate');
			post('/', 'GuideController@postQuestCreate');
		});
	});
	/**
	 * Locations
	 */
	Route::group(['prefix' => 'locations'], function() {
		get('/', 'GuideController@getLocations');
		get('{id}-{name}', 'GuideController@getLocationView');
		/**
		 * Create Location Guide
		 */
		Route::group(['prefix' => 'create'], function() {
			get('/', 'GuideController@getLocationCreate');
			post('/', 'GuideController@postLocationCreate');
		});
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
 * Members
 */
Route::group(['prefix' => 'members'], function() {
	get('/', 'MembersController@getPage', ['page' => 1]);
	get('role={searchRole}/prefix={searchPrefix}/order={searchOrder}', 'MembersController@getPage');
});

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

/**
 * News
 */
Route::group(['prefix' => 'news'], function() {
	get('/', 'NewsController@getIndex');
	get('{slug}', 'NewsController@getView');
	get('search/{searchSlug}', 'NewsController@getSearch');
	/**
	 * Staff only
	 */
	Route::group(['middleware' => 'staff'], function() {
		/**
		 * Create newspiece
		 */
		Route::group(['prefix' => 'create'], function() {
			get('/', 'NewsController@getCreate');
			post('/', 'Newscontroller@postCreate');
		});
	});
});

/**
 * Play
 */
Route::group(['prefix' => 'play'], function() {
	get('/', 'PlayController@getIndex');
	get('3', 'PlayController@get3');
	get('osrs', 'PlayController@getOSRS');
});

/**
 * Profile
 */
Route::group(['prefix' => 'profile/{id}-{name}'], function() {
	get('/', 'ProfileController@getProfileIndex');
	get('feed', 'ProfileController@getProfileFeed');
	get('friends', 'ProfileController@getProfileFriends');
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
	get('requests/current','RadioController@getRequestsCurrent');
	Route::group(['middleware' => 'auth'], function() {
		get('send/request/{artist}/{name}', 'RadioController@getSendRequest');
	});
});
/**
 * Settings
 */
Route::group(['middleware' => 'auth', 'prefix' => 'settings'], function() {
	get('/', 'SettingsController@getIndex');
	post('/', 'SettingsController@postIndex');
	get('about/me', 'SettingsController@getAbout');
	post('about/me', 'SettingsController@postAbout');
	get('password', 'SettingsController@getPassword');
	post('password', 'SettingsController@postPassword');
	get('photo', 'SettingsController@getPhoto');
	post('photo', 'SettingsController@postPhoto');
	get('runescape', 'SettingsController@getRunescape');
	post('runescape', 'SettingsController@postRunescape');
	get('signature', 'SettingsController@getSignature');
	post('signature', 'SettingsCOntroller@postSignature');
	get('social', 'SettingsController@getSocial');
	post('social', 'SettingsController@postSocial');
});

/**
 * Signatures
 */
Route::group(['prefix' => 'signatures'], function() {
	get('/', 'SignatureController@getIndex');
	post('/', 'SignatureController@postUsername');
	get('username={username}/type={type}', 'SignatureController@getStyle');
	get('username={username}/type={type}/style={style}', 'SignatureController@getFinal');
	get('h{slug}', 'SignatureController@getDisplay');
});

/**
 * Staff
 */
Route::group(['prefix' => 'staff'], function() {
	get('list', 'StaffController@getList');
	/**
	 * Only staff can access
	 */
	Route::group([], function() {
		get('/', 'StaffController@getIndex');
		get('checkup', 'StaffController@getCheckup');
		post('checkup', 'StaffController@postCheckup');
		get('checkup/view/{id}', 'StaffController@getCheckupView');
		get('checkup/list', 'StaffController@getCheckupList');
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

		/**
		 * Radio Panel
		 */
		Route::group(['middleware' => 'staff.radio', 'prefix' => 'radio'], function() {
			get('/', 'StaffController@getRadioIndex');
		});

		/**
		 * Administrator Panel
		 */
		Route::group(['middleware' => 'staff.admin', 'prefix' => 'administrator'], function() {
			get('/', 'StaffController@getAdministratorPanel');
		});
	});
});

/**
 * Transparency
 */
Route::group(['prefix' => 'transparency'], function() {
	get('/', 'TransparencyController@getIndex');
	get('markdown', 'TransparencyController@getMarkdown');
});