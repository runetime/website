<?php
namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * Class MediaController
 */
final class MediaController extends Controller
{
    /**
     * @return View
     */
    public function getIndex()
    {
        $this->nav('navbar.social.title');
        $this->title('media.title');

        return $this->view('media');
    }
}
