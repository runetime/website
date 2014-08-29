<?php
App::error(function($exception,$code){
	switch($code){
		case 403:
			return Response::view('errors.forbidden',['title'=>'Forbidden From Access','nav'=>'Forbidden From Access'],403);
			break;
		case 404:
			return Response::view('errors.missing',['title'=>'Page Not Found','nav'=>'Page Not Found'],404);
			break;
		// case 500:
		// 	return Response::view('errors.internal',['title'=>'Internal Service Error','nav'=>'Internal Service Error'],500);
//		    break;
		 default:
		 	return Response::view('errors.missing',['title'=>'Page Not Found','nav'=>'Page Not Found'],$code);
			break;
	}
});
