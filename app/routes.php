<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

#About
Route::get('about','AboutController@index');

#Awards
Route::get('awards','AwardController@index');

/**
 * Calculators
 */
Route::group(['prefix'=>'calculators'],function(){
	Route::get('/','CalculatorController@index');
	Route::get('{name}','CalculatorController@selection');
});

/**
 * Calendar
 */
Route::group(['prefix'=>'calendar'],function(){
	Route::get('/','CalendarController@index');
	/**
	 * Follow/subscribe to calendar/event
	 */
	Route::group(['before'=>'auth.logged','prefix'=>'follow'],function(){
		Route::get('calendar/{id}','CalendarController@followCalendar');
		Route::get('event/{id}','CalendarController@followEvent');
	});
	/**
	 * View
	 */
	Route::group(['prefix'=>'view'],function(){
		Route::get('event/{id}','CalendarController@viewEvent');
		Route::get('month/{year}/{month}','CalendarController@viewMonth');
		Route::get('week/{week}','CalendarController@viewWeek');
		Route::get('day/{year}/{month}/{day}','CalendarController@viewDay');
	});
});

/**
 * Databases
 */
Route::group(['prefix'=>'databases'],function(){
	Route::get('/','DatabaseController@index');
	/**
	 * Item Database
	 */
	Route::group(['prefix'=>'items'],function(){
		Route::get('/','DatabaseController@itemIndex');
		Route::get('filter/{order}/{members}/{tradable}/{quest}','DatabaseController@itemFilter');
		Route::post('search','DatabaseController@itemSearch');
		/**
		 * Stuff to do with a single item
		 */
		Route::group(['prefix'=>'{id}/{name}'],function(){
			Route::get('/','DatabaseController@itemView');
			/**
			 * Content group+Admin permissions only
			 */
			Route::group(['before'=>'auth.content'],function(){
				Route::get('edit','DatabaseController@itemEdit');
				Route::post('edit','DatabaseController@itemEditDone');
				Route::get('remove','DatabaseController@itemRemove');
			});
		});
	});
	/**
	 * Monster Database
	 */
	Route::group(['prefix'=>'monsters'],function(){
		Route::get('/','DatabaseController@monsterIndex');
		Route::get('filter/{order}/{members}','DatabaseController@monsterFilter');
		Route::post('search','DatabaseController@monsterSearch');
		/**
		 * Stuff to do with a single monster
		 */
		Route::group(['prefix'=>'{id}/{name}'],function(){
			Route::get('/','DatabaseController@monsterView');
			/**
			 * Content group+Admin permissions only
			 */
			Route::group(['before'=>'auth.content'],function(){
				Route::get('edit','DatabaseController@monsterEdit');
				Route::post('edit','DatabaseController@monsterEditDone');
				Route::get('remove','DatabaseController@monsterRemove');
			});
		});
	});
});

/**
 * Guides
 */
Route::group(['prefix'=>'guides'],function(){
	Route::get('/','GuideController@index');
	/**
	 * Locations
	 */
	Route::group(['prefix'=>'locations'],function(){
		Route::get('/','GuideController@locationIndex');
		Route::get('{id}/{name}','GuideController@locationView');
		Route::get('filter/{order}','GuideController@locationFilter');
	});
	/**
	 * Quests
	 */
	Route::group(['prefix'=>'quests'],function(){
		Route::get('/','GuideController@questIndex');
		Route::get('{id}/{name}','GuideController@questView');
		Route::get('filter/{order}/{difficulty}/{length}/{membership}','GuideController@questFilter');
	});
});

#Home
Route::get('/','HomeController@index');
Route::get('home','HomeController@index');

#Livestream
Route::get('livestream','LivestreamController@index');

/**
 * Map
 */
Route::group(['prefix'=>'map'],function(){
	Route::get('/','MapController@index');
	Route::get('runescape-3','MapController@rs3');
	Route::get('old-school-runescape','MapController@osrs');
});

#Media
Route::get('media','MediaController@index');

#News
Route::get('news','NewsController@index');

#Play
Route::get('play','PlayController@index');

#Radio
Route::get('radio','RadioController@index');

/**
 * Signatures
 */
Route::group(['prefix'=>'signatures'],function(){
	Route::get('/','SignatureController@index');
	Route::get('{type}','SignatureController@type');
	Route::get('completed','SignatureController@completed');
});

#Staff
Route::get('staff','StaffController@index');

/**
 * Tickets
 */
Route::group(['before'=>'auth.logged','prefix'=>'tickets'],function(){
	Route::get('/','TicketController@index');
	/**
	 * Viewing ticket and staff' permissions with ticket
	 */
	Route::group(['prefix'=>'{id}'],function(){
		Route::get('view','TicketController@view');
		/**
		 * Staff
		 */
		Route::group(['before'=>'auth.staff'],function(){
			Route::get('close','TicketController@close');
			Route::get('escalate','TicketController@escalate');
			Route::get('transfer','TicketController@transferForm');
			Route::post('transfer','TicketController@transferDone');
		});
	});
});