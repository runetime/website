<?php
namespace App\Http\Controllers;

/**
 * Class CookieController
 */
class CookieController extends Controller
{
    /**
     * Returns the Cookie page.
     */
    public function getIndex()
    {
        $this->nav('navbar.runetime.title');
        $this->title('cookies.title');

        return $this->view('cookies');
    }
}
