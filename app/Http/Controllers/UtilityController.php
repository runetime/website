<?php
namespace App\Http\Controllers;
use App\Http\Requests\NameCheck\CheckRequest;
class UtilityController extends BaseController {
	/**
	 * @return \Illuminate\View\View
	 */
	public function getNameCheck() {
		$this->nav('Runescape');
		$this->title('Name Checker');
		return $this->view('utility.namecheck');
	}

	/**
	 * @param CheckRequest $form
	 *
	 * @return mixed
	 */
	public function postNameCheck(CheckRequest $form) {
		$url = 'http://services.runescape.com/m=hiscore/index_lite.ws?player=' . $form->rsn;
		return \String::CURL($url);
	}
}