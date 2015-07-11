<?php
namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * Class DonateController
 */
final class DonateController extends Controller
{
    /**
     * Returns the Donate page.
     *
     * @return View
     */
    public function getIndex()
    {
        $this->nav('navbar.runetime.title');
        $this->title('donate.title');

        return $this->view('donate');
    }
}
