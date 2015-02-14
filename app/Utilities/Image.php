<?php
namespace App\Utilities;

/**
 * Class Image
 * @package App\Utilities
 */
class Image
{
	/**
	 * Outputs the image of a user based on their ID and any classes listed in [, array $classes]
	 *
	 * @param   int $userId The ID of the user to display an image of
	 * @param array $classes
	 * @returns String The img of the user along with classes specified in [, array $classes]
	 */
	public static function userPhoto($userId, array $classes = [])
	{
		// Add img-responsive to classes
		$classes[] .= 'img-responsive';

		$path = 'no_photo';
		if(file_exists('./img/forums/photos/' . $userId . '.png')) {
			$path = $userId;
		}

		// Implode classes into a string
		$classList = implode(' ', $classes);

		return view('image.user_photo', compact('path', 'classList'));
	}
}