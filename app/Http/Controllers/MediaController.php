<?php
namespace App\Http\Controllers;

/**
 * Class MediaController
 */
class MediaController extends Controller
{
    /**
     * @return \Illuminate\View\View
     */
    public function getIndex()
    {
        $this->nav('navbar.social.title');
        $this->title('media.title');

        return $this->view('media');
    }
}
