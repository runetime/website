<?php
/*
|--------------------------------------------------------------------------
| Pages
|--------------------------------------------------------------------------
*/

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
});

/**
 * Calendar
 */
Route::group(['prefix'=>'calendar'],function(){
	Route::get('/','CalendarController@getIndex');
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
 * Guides
 */
Route::group(['prefix'=>'guides'],function(){
	Route::get('/','GuideController@getIndex');
	Route::group(['prefix'=>'{type}'],function(){
		Route::get('/','GuideController@getViewGuides');
		Route::get('{slug}','GuideController@getViewGuide');
		Route::get('search/{searchSlug}','GuideController@getSearch');
	});
});

/**
 * Home
 */
Route::get('/','HomeController@getIndex');

/**
 * Livestream
 */
Route::group(['prefix'=>'livestream'],function(){
	Route::get('/','LivestreamController@getIndex');
});

/**
 * Map
 */
Route::group(['prefix'=>'map'],function(){
	Route::get('/','MapController@getIndex');
	Route::get('{type}','MapController@getMap');
	Route::get('{type}/{version}','MapController@getMap');
});

/**
 * News
 */
Route::group(['prefix'=>'news'],function(){
	Route::get('/','NewsController@getIndex');
	Route::get('{slug}','NewsController@getView');
	Route::get('search/{searchSlug}','NewsController@getSearch');
});

/**
 * Radio
 */
Route::group(['prefix'=>'radio'],function(){
	Route::get('/','RadioController@getIndex');
});

/**
 * Signature Generator
 */
Route::group(['prefix'=>'signatures'],function(){
	Route::get('/','SignatureGenerator@getIndex');
	Route::group(['prefix'=>'{type}'],function(){
		Route::get('/','SignatureGenerator@getType');
		Route::get('{slug}','SignatureGenerator@getStyle');
		Route::get('{slug}/{style}','SignatureGenerator@getFinal');
	});
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

	});
	Route::get('list','StaffController@getList');
});

/*
|--------------------------------------------------------------------------
| Script calls such as AJAX
|--------------------------------------------------------------------------
*/
