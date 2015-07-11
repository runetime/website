<?php
namespace App\Utilities;

/**
 * Class Error
 */
final class Error
{
    /**
     * Returns a view for an error based on the HTTP Status given.
     *
     * @param $status
     *
     * @return \Illuminate\View\View
     */
    public static function abort($status)
    {
        switch ($status) {
            case 403:
                return view('errors.forbidden');
                break;
            case 404:
            default:
                return view('errors.missing');
                break;
        }
    }
}
