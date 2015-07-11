<?php
namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * Class CookieController
 */
final class CookieController extends Controller
{
    /**
     * Returns the Cookie page.
     *
     * @return View
     */
    public function getIndex()
    {
        $this->nav('navbar.runetime.title');
        $this->title('cookies.title');

        return $this->view('cookies');
    }
}
