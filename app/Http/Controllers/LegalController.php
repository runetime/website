<?php
namespace App\Http\Controllers;

class LegalController extends BaseController
{
	public function getLegal($language)
	{
		if($language == "english") {
			$lang = "en";
		} else {
			$lang = "en";
		}

		\Lang::setLocale($lang);

		$this->nav('navbar.runetime.runetime');
		$this->title(trans('legal.title'));
		return $this->view('legal.legal');
	}
	/**
	 * @return \Illuminate\View\View
	 */
	public function getPrivacy()
	{
		$this->nav('navbar.runetime.runetime');
		$this->title(trans('legal.privacy.title'));
		return $this->view('legal.privacy');
	}

	/**
	 * @return \Illuminate\View\View
	 */
	public function getTerms()
	{
		$this->nav('navbar.runetime.runetime');
		$this->title(trans('legal.terms.title'));
		return $this->view('legal.terms');
	}
}