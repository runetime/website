<?php
namespace App\Http\Controllers;
class LanguageController extends BaseController {
	/**
	 * @get("language/set")
	 *
	 * @return \Illuminate\View\View
	 */
	public function getSet() {
		$languagesDone = [
			'en' => 'English',
			'no' => 'Norweigian',
		];
		$languagesWIP = [
			'nl' => 'Dutch',
			'es' => 'Spanish',
		];
		$this->nav('RuneTime');
		$this->title('Set Your Language');
		return $this->view('language.set', compact('languagesDone', 'languagesWIP'));
	}

	/**
	 * @get("language/set/{initials}")
	 *
	 * @param $initials
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function getChange($initials) {
		$languagesDone = [
			'en' => 'English',
			'no' => 'Norweigian',
		];
		if(array_key_exists($initials, $languagesDone))
			\Cache::forever('ip.' . \Request::getClientIp() . '.lang', $initials);
		return \redirect()->to('/');
	}
}