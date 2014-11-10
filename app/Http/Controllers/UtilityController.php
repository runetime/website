<?php
namespace App\Http\Controllers;
use App\Http\Requests\NameCheckForm;
class UtilityController extends BaseController {
	/**
	 * @get("name/check")
	 * @return \Illuminate\View\View
	 */
	public function getNameCheck() {
		$this->nav('Runescape');
		$this->title('Name Checker');
		return $this->view('utility.namecheck');
	}

	/**
	 * @post("name/check")
	 * @return mixed
	 */
	public function postNameCheck(NameCheckForm $form) {
		$url = 'http://services.runescape.com/m=hiscore/index_lite.ws?player=' . $form->input('rsn');
		$response = \String::CURL($url);
		return $response;
	}
}