<?php
/*
|-----------|
| Resources |
|-----------|
*/

Route::resource('user', 'Runis\Accounts\User');



/*
|-------|
| Pages |
|-------|
*/

/**
 * About
 */
get('about','AboutController@getIndex');

/**
 * Awards
 */
Route::group(['prefix'=>'awards'],function(){
	get('/','AwardController@getIndex');
	get('{slug}','AwardController@getView');
});

/**
 * Calculators
 */
Route::group(['prefix'=>'calculators'],function(){
	get('/','CalculatorController@getIndex');
	get('{type}','CalculatorController@getView');
	post('load','CalculatorController@postLoad');
});

/**
 * Calendar
 */
Route::group(['prefix'=>'calendar'],function(){
	get('/','CalendarController@getIndex');
});

/**
 * Chat
 */
Route::group(['prefix'=>'chat'],function(){
	get('channels','ChatController@getChannels');
	post('channels/check','ChatController@postCheckChannel');
	post('update','ChatController@postUpdate');
	post('start','ChatController@postStart');
	Route::group(['before'=>'auth.logged','prefix'=>'post'],function(){
		post('message','ChatController@postMessage');
		post('status/change','ChatController@postStatusChange');
	});
});

/**
 * Clan
 */
Route::group(['prefix'=>'clan'],function(){
	get('/','ClanController@getIndex');
});

/**
 * Databases
 */
Route::group(['prefix'=>'databases'],function(){
	get('/','DatabaseController@getIndex');
	Route::group(['prefix'=>'{type}'],function(){
		get('/','DatabaseController@getViewDatabase');
		get('{slug}','DatabaseController@getViewItem');
		get('search/{searchSlug}','DatabaseController@getSearch');
	});
});

/**
 * Donate
 */
Route::group(['prefix'=>'donate'],function(){
	get('/','DonateController@getIndex');
});

/**
 * Get
 */
Route::group(['prefix'=>'get'],function(){
	get('hiscore/{rsn}','GetController@getHiscore');
	Route::group(['prefix'=>'signup'],function(){
		post('email','GetController@postEmail');
		post('display_name','GetController@postDisplayName');
	});
	get('bbcode','GetController@getBBCode');
});

/**
 * Guides
 */
Route::group(['prefix'=>'guides'],function(){
	get('/','GuideController@getIndex');
	Route::group(['prefix'=>'{type}'],function(){
		get('/','GuideController@getType');
		get('difficulty={searchDifficulty}/length={searchLength}/membership={searchMembership}','GuideController@getType');
		get('{id}-{name}','GuideController@getViewGuide');
		get('search/{searchSlug}','GuideController@getSearch');
	});
});

/**
 * Home
 */
get('/','HomeController@getIndex');

/**
 * Legal Pages
 */
Route::group([],function(){
	get('privacy','LegalController@getPrivacy');
	get('terms','LegalController@getTerms');
});

/**
 * Livestream
 */
Route::group(['prefix'=>'livestream'],function(){
	get('/','LivestreamController@getIndex');
});

/**
 * Login
 */
Route::group(['prefix'=>'login'],function(){
	get('/','AuthController@getLoginForm');
	post('/','AuthController@postLoginForm');
});

/**
 * Logout
 */
get('logout','AuthController@getLogout');

/**
 * Map
 */
Route::group(['prefix'=>'map'],function(){
	get('/','MapController@getIndex');
	get('members','MapController@getMembers');
	Route::group(['prefix'=>'runescape'],function(){
		get('/','MapController@getRunescape');
		get('3','MapController@getRS3');
		get('old-school','MapController@getOS');
	});
});

/**
 * Members
 */
Route::group(['prefix'=>'members'],function(){
	get('/','MembersController@getPage');
	get('page={page}','MembersController@getPage');
	get('search/{slug}','MembersController@getSearch');
});
/**
 * Media
 */
Route::group(['prefix'=>'media'],function(){
	get('/','MediaController@getIndex');
});

/**
 * News
 */
Route::group(['prefix'=>'news'],function(){
	get('/','NewsController@getIndex');
	Route::group(['before'=>'auth.staff','prefix'=>'create'],function(){
		get('/','NewsController@getCreate');
		post('/','NewsController@postCreate');
	});
	get('{slug}','NewsController@getView');
	get('search/{searchSlug}','NewsController@getSearch');
});

/**
 * Play
 */
Route::group(['prefix'=>'play'],function(){
	get('/','PlayController@getIndex');
	get('3','PlayController@get3');
	get('osrs','PlayController@getOSRS');
});

/**
 * Radio
 */
Route::group(['prefix'=>'radio'],function(){
	get('/','RadioController@getIndex');
	get('request/history','RadioController@getHistory');
	get('request/song','RadioController@getSong');
	get('request/timetable','RadioController@getTimetable');
	get('update','RadioController@getUpdate');
	get('send/request/{artist}/{name}','RadioController@getSendRequest');
});

/**
 * Signature Generator
 */
Route::group(['prefix'=>'signatures'],function(){
	get('/','SignatureController@getIndex');
	post('/','SignatureController@postUsername');
	Route::group(['prefix'=>'username={username}/type={type}'],function(){
		get('/','SignatureController@getStyle');
		get('style={style}','SignatureController@getFinal');
		get('style={style}/display','SignatureController@getDisplay');
	});
});

/**
 * Sign Up
 */
Route::group(['prefix'=>'signup'],function(){
	get('/','AuthController@getSignupForm');
	post('/','AuthController@postSignupForm');
});

/**
 * Social
 */
Route::group(['prefix'=>'social'],function(){
	get('/','SocialController@getIndex');
});

/**
 * Staff
 */
Route::group(['prefix'=>'staff'],function(){
	/**
	 * Staff Only
	 */
	Route::group(['before'=>'auth.staff'],function(){
		get('/','StaffController@getIndex');
	});
	get('list','StaffController@getList');
});

/**
 * Utility single-pages
 */
Route::group(['prefix'=>'utility'],function(){
	get('name-check','UtilityController@getNameCheck');
	post('name-check','UtilityController@postNameCheck');
});



/*
|-------|
| Forum |
|-------|
*/
Route::group(['prefix'=>'forums'],function(){
	get('/','ForumController@getIndex');
	post('reply','ForumController@postReply');

	/**
	 * Viewing Subforum
	 */
	Route::group([],function(){
		get('{id}-{slug}/page={page}','ForumController@getSubforum');
		get('{id}-{slug}','ForumController@getSubforum');
	});
	
	/**
	 * Viewing Thread
	 */
	Route::group(['prefix'=>'thread'],function(){
		get('{id}-{name}/page={page}','ForumController@getThread');
		get('{id}-{name}','ForumController@getThread');
	});
	
	/**
	 * Create Thread
	 */
	Route::group(['before'=>'auth.logged','prefix'=>'create/{id}-{name}'],function(){
		get('/','ForumController@getThreadCreate');
		post('/','ForumController@postThreadCreate');
	});
	/**
	 * Settings
	 */
	Route::group(['prefix'=>'settings'],function(){
		get('/','ForumController@getSettingsIndex');
	});
	
	/**
	 * Messenger
	 */
	Route::group(['prefix'=>'messenger'],function(){
		get('/','ForumController@getMessengerIndex');
		get('create','ForumController@getMessengerCreate');
		post('create','ForumController@postMessengerCreate');
		get('{id}-{slug}','ForumController@getMessengerView');
		post('reply','ForumController@postMessengerReply');
	});

	/**
	 * Content
	 */
	Route::group(['prefix'=>'content'],function(){
		get('/','ForumController@getContentIndex');
	});
	
	/**
	 * Statuses
	 */
	Route::group(['prefix'=>'statuses'],function(){
	});
});