<?php
namespace App\Http\Controllers;

use DirectoryIterator;
use FilesystemIterator;

class LanguageController extends Controller
{
	/**
	 * @return \Illuminate\View\View
	 */
	public function getSet()
	{
		$languageList = $this->languages();
		$langs = $this->languageSort($languageList);

		$this->nav('navbar.runetime.title');
		$this->title('language.set.title');
		return $this->view('language.set', compact('langs'));
	}

	/**
	 * @param        $initials
	 * @param string $redirect
	 *
	 * @return \Illuminate\Http\RedirectResponse
	 */
	public function getChange($initials, $redirect = '')
	{
		$languageList = $this->languages();
		$langs = $this->languageSort($languageList);

		if(in_array($initials, $langs['done'])) {
			\Cache::forever('ip.' . \Request::getClientIp() . '.lang', $initials);
		}

		return \redirect()->to('/' . $redirect);
	}

	/**
	 * @param array $languages
	 *
	 * @return array
	 */
	private function languageSort(Array $languages)
	{
		$langs = [
			'done' => [],
			'wip' => [],
		];
		$path = base_path('resources/lang');
		$englishFiles = $this->filesInDirectory($path . '/en');
		foreach(new DirectoryIterator($path) as $file) {
			$iso = $file->getFilename();
			if($file->isDot()) {
				continue;
			}

			if($file->isDir()) {
				$files = $this->filesInDirectory($path . '/' . $iso);
				if($files === $englishFiles) {
					$langs['done'][$iso] = $languages[$iso];
				} else {
					$langs['wip'][$iso] = $languages[$iso];
				}
			}
		}

		return $langs;
	}

	/**
	 * @param $path
	 *
	 * @return int
	 */
	private function filesInDirectory($path)
	{
		$iterator = new FilesystemIterator($path, FilesystemIterator::SKIP_DOTS);

		$files = iterator_count($iterator);

		return $files;
	}

	/**
	 * @return array|mixed
	 */
	private function languages()
	{
		$path = base_path('resources/lang/languages.md');
		$checksum = md5_file($path);
		$cache = \Cache::get('languages.file.iso.checksum');
		if($cache === $checksum) {
			return \Cache::get('languages.file.iso.cache');
		}

		\Cache::forever('languages.file.iso.checksum', $checksum);

		$languageArray = [];

		$languageFile = file_get_contents(base_path('resources/lang/languages.md'));
		$languages = explode("\n", $languageFile);
		foreach($languages as $language) {
			$language = str_replace("- ", "", $language);
			$language = explode(": ", $language);
			$iso = $language[0];

			$locales = explode(" `", $language[1]);
			$locales[1] = str_replace("`", "", $locales[1]);

			$languageArray[$iso] = [
				'english' => $locales[0],
				'local'   => $locales[1],
			];
		}

		\Cache::forever('languages.file.iso.cache', $languageArray);

		return $languageArray;
	}
}