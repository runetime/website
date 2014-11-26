<?php
namespace App\Http\Controllers;
use App\Http\Requests\NameCheck\CheckRequest;
class NameCheckerController extends BaseController {
	/**
	 * @return \Illuminate\View\View
	 */
	public function getIndex() {
		$this->nav('Runescape');
		$this->title('Name Checker');
		return $this->view('namechecker');
	}

	/**
	 * @param CheckRequest $form
	 *
	 * @return mixed
	 */
	public function postCheck(CheckRequest $form) {
		$url = 'http://services.runescape.com/m=hiscore/index_lite.ws?player=' . $form->rsn;
		return \String::CURL($url);
	}
}