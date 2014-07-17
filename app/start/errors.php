<?php
App::error(function($exception,$code){
	switch($code){
		case 403:
			return Response::view('errors.forbidden',['title'=>'Forbidden From Page'],403);
		case 404:
			return Response::view('errors.missing',['title'=>'Page Not Found'],404);
		// case 500:
		// 	return Response::view('errors.internal',['title'=>'Page Not Found'],500);
		// default:
		// 	return Response::view('errors.missing',['title'=>'Page Not Found'],$code);
	}
});