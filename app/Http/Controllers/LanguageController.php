<?php
namespace App\Http\Controllers;

class LanguageController extends BaseController {
	/**
	 * @return \Illuminate\View\View
	 */
	public function getSet() {
		$languagesDone = ['en', 'no'];
		$languagesWIP = ['es'];
		$this->nav('navbar.runetime.runetime');
		$this->title(trans('language.set.title'));
		return $this->view('language.set', compact('languagesDone', 'languagesWIP'));
	}

	/**
	 * @param        $initials
	 * @param string $redirect
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function getChange($initials, $redirect = '') {
		$languagesDone = [
			'en' => 'English',
			'no' => 'Norweigian',
		];
		if(array_key_exists($initials, $languagesDone))
			\Cache::forever('ip.' . \Request::getClientIp() . '.lang', $initials);
		return \redirect()->to('/' . $redirect);
	}
}