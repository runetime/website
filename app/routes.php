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
 * Calculators
 */
Route::group(['prefix'=>'calculators'],function(){
	Route::get('/','CalculatorController@index');
	Route::get('{name}','CalculatorController@selection');
});

/**
 * Databases
 */
Route::group(['prefix'=>'databases'],function(){
	Route::get('/','DatabaseController@index');
	Route::group(['prefix'=>'items'],function(){
		Route::get('/','DatabaseController@itemsIndex');
	});
});

/**
 * Guides
 */
Route::group(['prefix'=>'guides'],function(){
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
		});
	});
});