<?php
namespace App\Utilities;

/**
 * Class Image
 */
final class Image
{
    /**
     * Outputs the image of a user based on their
     * ID and any classes listed in $classes.
     *
     * @param       $userId
     * @param array $classes
     *
     * @return \Illuminate\View\View
     */
    public static function userPhoto($userId, array $classes = [])
    {
        // Add img-responsive to classes
        array_push($classes, 'img-responsive');

        $path = 'no_photo';

        if (file_exists('./img/forums/photos/' . $userId . '.png')) {
            $path = $userId;
        }

        // Implode classes into a string
        $classList = implode(' ', $classes);

        return view('partials.image.user_photo', compact('classList', 'path'))->render();
    }
}
