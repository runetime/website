<?php
namespace App\Http\Controllers;

/**
 * Class DonateController
 */
class DonateController extends Controller
{
    /**
     * Returns the Donate page.
     *
     * @return \Illuminate\View\View
     */
    public function getIndex()
    {
        $this->nav('navbar.runetime.title');
        $this->title('donate.title');

        return $this->view('donate');
    }
}
