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
Route::get('about','AboutController@getIndex');

/**
 * Awards
 */
Route::group(['prefix'=>'awards'],function(){
	Route::get('/','AwardController@getIndex');
	Route::get('{slug}','AwardController@getView');
});

/**
 * Calculators
 */
Route::group(['prefix'=>'calculators'],function(){
	Route::get('/','CalculatorController@getIndex');
	Route::get('{type}','CalculatorController@getView');
	Route::post('load','CalculatorController@postLoad');
});

/**
 * Calendar
 */
Route::group(['prefix'=>'calendar'],function(){
	Route::get('/','CalendarController@getIndex');
});

/**
 * Chat
 */
Route::group(['prefix'=>'chat'],function(){
	Route::post('update/{since}','ChatController@postUpdate');
	Route::post('start','ChatController@postStart');
	Route::group(['before'=>'auth.logged','prefix'=>'post'],function(){
		Route::post('message','ChatController@postMessage');
		Route::post('status/change','ChatController@postStatusChange');
	});
});
/**
 * Clan
 */
Route::group(['prefix'=>'clan'],function(){
	Route::get('/','ClanController@getIndex');
});

/**
 * Databases
 */
Route::group(['prefix'=>'databases'],function(){
	Route::get('/','DatabaseController@getIndex');
	Route::group(['prefix'=>'{type}'],function(){
		Route::get('/','DatabaseController@getViewDatabase');
		Route::get('{slug}','DatabaseController@getViewItem');
		Route::get('search/{searchSlug}','DatabaseController@getSearch');
	});
});

/**
 * Donate
 */
Route::group(['prefix'=>'donate'],function(){
	Route::get('/','DonateController@getIndex');
});

/**
 * Forums
 */
Route::group(['prefix'=>'forums'],function(){
	Route::get('/','ForumController@getIndex');
});

/**
 * Get
 */
Route::group(['prefix'=>'get'],function(){
	Route::get('hiscore/{rsn}','GetController@getHiscore');
	Route::group(['prefix'=>'signup'],function(){
		Route::post('email','GetSignupController@postEmail');
		Route::post('display_name','GetSignupController@postDisplayName');
	});
});

/**
 * Guides
 */
Route::group(['prefix'=>'guides'],function(){
	Route::get('/','GuideController@getIndex');
	Route::group(['prefix'=>'{type}'],function(){
		Route::get('/','GuideController@getType');
		Route::get('difficulty={searchDifficulty}/length={searchLength}/membership={searchMembership}','GuideController@getType');
		Route::get('{id}-{name}','GuideController@getViewGuide');
		Route::get('search/{searchSlug}','GuideController@getSearch');
	});
});

/**
 * Home
 */
Route::get('/','HomeController@getIndex');

/**
 * Legal Pages
 */
Route::group([],function(){
	Route::get('privacy','LegalController@getPrivacy');
	Route::get('terms','LegalController@getTerms');
});

/**
 * Livestream
 */
Route::group(['prefix'=>'livestream'],function(){
	Route::get('/','LivestreamController@getIndex');
});

/**
 * Login
 */
Route::group(['prefix'=>'login'],function(){
	Route::get('/','AuthController@getLoginForm');
	Route::post('/','AuthController@postLoginForm');
});

/**
 * Logout
 */
Route::get('logout','AuthController@getLogout');

/**
 * Map
 */
Route::group(['prefix'=>'map'],function(){
	Route::get('/','MapController@getIndex');
	Route::get('members','MapController@getMembers');
	Route::group(['prefix'=>'runescape'],function(){
		Route::get('/','MapController@getRunescape');
		Route::get('3','MapController@getRS3');
		Route::get('old-school','MapController@getOS');
	});
});

/**
 * Members
 */
Route::group(['prefix'=>'members'],function(){
	Route::get('/','MembersController@getPage');
	Route::get('page={page}','MembersController@getPage');
	Route::get('search/{slug}','MembersController@getSearch');
});
/**
 * Media
 */
Route::group(['prefix'=>'media'],function(){
	Route::get('/','MediaController@getIndex');
});

/**
 * News
 */
Route::group(['prefix'=>'news'],function(){
	Route::get('/','NewsController@getIndex');
	Route::group(['before'=>'auth.staff','prefix'=>'create'],function(){
		Route::get('/','NewsController@getCreate');
		Route::post('/','NewsController@postCreate');
	});
	Route::get('{id}-{slug}','NewsController@getView');
	Route::get('search/{searchSlug}','NewsController@getSearch');
});

/**
 * Play
 */
Route::group(['prefix'=>'play'],function(){
	Route::get('/','PlayController@getIndex');
	Route::get('3','PlayController@get3');
	Route::get('osrs','PlayController@getOSRS');
});

/**
 * Radio
 */
Route::group(['prefix'=>'radio'],function(){
	Route::get('/','RadioController@getIndex');
	Route::get('request/history','RadioController@getHistory');
	Route::get('request/song','RadioController@getSong');
	Route::get('request/timetable','RadioController@getTimetable');
	Route::get('requests/current','RadioController@getRequestsCurrent');
	Route::get('send/request/{artist}/{name}','RadioController@getSendRequest');
});

/**
 * Signature Generator
 */
Route::group(['prefix'=>'signatures'],function(){
	Route::get('/','SignatureController@getIndex');
	Route::post('/','SignatureController@postUsername');
	Route::group(['prefix'=>'username={username}/type={type}'],function(){
		Route::get('/','SignatureController@getStyle');
		Route::get('style={style}','SignatureController@getFinal');
		Route::get('style={style}/display','SignatureController@getDisplay');
	});
});

/**
 * Sign Up
 */
Route::group(['prefix'=>'signup'],function(){
	Route::get('/','AuthController@getSignupForm');
	Route::post('/','AuthController@postSignupForm');
});

/**
 * Social
 */
Route::group(['prefix'=>'social'],function(){
	Route::get('/','SocialController@getIndex');
});

/**
 * Staff
 */
Route::group(['prefix'=>'staff'],function(){
	/**
	 * Staff Only
	 */
	Route::group(['before'=>'auth.staff'],function(){
		Route::get('/','StaffController@getIndex');
	});
	Route::get('list','StaffController@getList');
});

/**
 * Utility single-pages
 */
Route::group(['prefix'=>'utility'],function(){
	Route::get('name-check','UtilityController@getNameCheck');
	Route::post('name-check','UtilityController@postNameCheck');
});