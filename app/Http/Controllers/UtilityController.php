<?php
namespace App\Http\Controllers;
class UtilityController extends BaseController {
	/**
	 * @return \Illuminate\View\View
	 */
	public function getNameCheck() {
		return view('utility.namecheck');
	}

	/**
	 * @return mixed
	 */
	public function postNameCheck() {
		$url = 'http://services.runescape.com/m=hiscore/index_lite.ws?player=' . \Input::get('rsn');
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		$results = curl_exec($curl);
		curl_close($curl);
		return $results;
	}
}