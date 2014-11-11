<?php
namespace App\Utilities;
class Image {
	/**
	 * Deprecated, use \Image::userPhoto() instead
	 * @param   int    $userId The ID of the user to display the photo of
	 * @returns String The image of the user to display the photo of
	 */
	public static function memberPhoto($userId) {
		return self::userPhoto($userId);
	}

	/**
	 * Outputs the image of a user based on their ID and any classes listed in [, array $classes]
	 *
	 * @param   int $userId The ID of the user to display an image of
	 * @param array $classes
	 * @returns String The img of the user along with classes specified in [, array $classes]
	 */
	public static function userPhoto($userId, array $classes=[]) {
		$str = "<img src='/img/forums/photos/";
		if(file_exists('./img/forums/photos/' . $userId . '.png'))
			$str .= $userId;
		else
			$str .= 'no_photo';
		$str .= ".png' alt='Photo' class='img-responsive";
		foreach($classes as $class) $str .= " " . $class;
		return $str . "' />";
	}
}