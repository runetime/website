<?php
namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * Class PlayController
 */
final class PlayController extends Controller
{
    /**
     * @return View
     */
    public function getIndex()
    {
        $this->nav('navbar.runescape.title');
        $this->title('play.index.play_runescape');

        return $this->view('play.index');
    }

    /**
     * @return View
     */
    public function get3()
    {
        $this->bc(['play' => trans('play.index.play_runescape')]);
        $this->nav('navbar.runescape.title');
        $this->title('play.index.3');

        return $this->view('play.3');
    }

    /**
     * @return View
     */
    public function getOSRS()
    {
        $this->bc(['play' => trans('play.index.play_runescape')]);
        $this->nav('navbar.runescape.title');
        $this->title('play.index.osrs');

        return $this->view('play.osrs');
    }
}
