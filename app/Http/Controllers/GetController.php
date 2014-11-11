<?php
namespace App\Http\Controllers;
use App\RuneTime\BBCode\BBCodeRepository;
use App\Runis\Accounts\UserRepository;
use Illuminate\Http\Request;
class GetController extends BaseController {
	private $bbcode;
	private $users;

	/**
	 * @param BBCodeRepository $bbcode
	 * @param UserRepository   $users
	 */
	public function __construct(BBCodeRepository $bbcode, UserRepository $users) {
		$this->bbcode = $bbcode;
		$this->users = $users;
	}

	/**
	 * @param Request $form
	 *
	 * @return string
	 */
	public function postEmail(Request $form) {
		$available = true;
		if($this->users->getByEmail($form->email))
			$available = false;
		return json_encode(['available' => $available]);
	}

	/**
	 * @param Request $form
	 *
	 * @return string
	 */
	public function postDisplayName(Request $form) {
		$available = true;
		if($this->users->getByDisplayName($form->display_name) || $this->users->getByDisplayName($form->display_name))
			$available = false;
		return json_encode(['available' => $available]);
	}

	/**
	 * @param $rsn
	 *
	 * @return string
	 */
	public function getHiscore($rsn) {
		$url='http://services.runescape.com/m=hiscore/index_lite.ws?player=' . $rsn;
		$results = \String::CURL($url);
		return json_encode($results);
	}

	/**
	 * @return string
	 */
	public function getBBCode() {
		$bbcodes = $this->bbcode->getAll();
		$bbcodeList = [];
		foreach($bbcodes as $bbcode) {
			$bbcodeCurrent = new \stdClass;
			$bbcodeCurrent->name = $bbcode->name;
			$bbcodeCurrent->example = $bbcode->example;
			$bbcodeCurrent->parsed = $bbcode->parsed;
			array_push($bbcodeList, $bbcodeCurrent);
		}
		return json_encode($bbcodeList);
	}
}