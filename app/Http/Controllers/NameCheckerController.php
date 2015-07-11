<?php
namespace App\Http\Controllers;

use App\Http\Requests\NameCheck\CheckRequest;
use Illuminate\View\View;

/**
 * Class NameCheckerController
 */
final class NameCheckerController extends Controller
{
    /**
     * @return View
     */
    public function getIndex()
    {
        $this->nav('navbar.runescape.title');
        $this->title('namechecker.title');

        return $this->view('namechecker.index');
    }

    /**
     * @return View
     */
    public function getPlain()
    {
        return $this->view('namechecker.plain');
    }

    /**
     * @param CheckRequest $form
     *
     * @return mixed
     */
    public function postCheck(CheckRequest $form)
    {
        $url = 'http://services.runescape.com/m=hiscore/index_lite.ws?player=' . $form->rsn;

        return \String::CURL($url);
    }
}
