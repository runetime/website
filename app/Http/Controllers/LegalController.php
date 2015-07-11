<?php
namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * Class LegalController
 */
final class LegalController extends Controller
{
    /**
     * @param $language
     *
     * @return View
     */
    public function getLegal($language)
    {
        if ($language === 'english') {
            $lang = 'en';
        } else {
            $lang = 'en';
        }

        \Lang::setLocale($lang);

        $this->nav('navbar.runetime.title');
        $this->title('legal.title');

        return $this->view('legal.legal');
    }
    /**
     * @return View
     */
    public function getPrivacy()
    {
        $this->nav('navbar.runetime.title');
        $this->title('legal.privacy.title');

        return $this->view('legal.privacy');
    }

    /**
     * @return View
     */
    public function getTerms()
    {
        $this->nav('navbar.runetime.title');
        $this->title('legal.terms.title');

        return $this->view('legal.terms');
    }
}
