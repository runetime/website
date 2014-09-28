<?php
namespace App\Utilities;
class Image{
	public static function memberPhoto($userId){
		if(file_exists('./img/forum/photos/'.$userId.'.png'))
			return '/img/forum/photos/'.$userId.'.png';
		else
			return '/img/forum/photos/no_photo.png';
	}
}