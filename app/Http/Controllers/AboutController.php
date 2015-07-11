<?php
namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * Class AboutController
 */
final class AboutController extends Controller
{
    /**
     * Returns the About page.
     *
     * @return View
     */
    public function getIndex()
    {
        $this->nav('navbar.runetime.title');
        $this->title('about.name');

        return $this->view('about');
    }
}
