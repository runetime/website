<?php
namespace App\Utilities;

use App\Runis\Accounts\Role;
use App\Runis\Accounts\RoleRepository;
use App\Runis\Accounts\User;

class String
{
	/**
	 * Determines whether a string begins with a substring
	 * @param  string $needle    The substring to search a larger string for
	 * @param  string $haystack  The larger string to search within
	 * @return boolean           Whether a string begins with a substring
	 */
	public static function startsWith($needle = "", $haystack = "")
	{
		return(substr($haystack, 0, strlen($needle)) === $needle);
	}

	/**
	 * Determines whether a string ends with a substring
	 * @param  string $needle    The substring to search a larger string for
	 * @param  string $haystack  The larger string to search within
	 *
	 * @return boolean           Whether a string ends with a substring
	 */
	public static function endsWith($needle="",$haystack=""){
		return(substr($haystack, -strlen($needle)) === $needle);
	}

	/**
	 * @param        $needle
	 * @param        $haystack
	 * @param string $with
	 *
	 * @return mixed
	 */
	public static function replaceFirst($needle, $haystack, $with = '')
	{
		$pos = strpos($haystack, $needle);

		if($pos !== false) {
			return substr_replace($haystack, $with, $pos, strlen($needle));
		}

		return $haystack;
	}

	/**
	 * @param $url
	 *
	 * @return mixed
	 */
	public static function CURL($url)
	{
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		$results = curl_exec($curl);
		curl_close($curl);

		return $results;
	}

	/**
	 * @return string
	 */
	public static function slugEncode()
	{
		$args = func_get_args();
		$slug = "";

		foreach($args as $x => $arg) {
			$from = ['?', ' '];
			$to = [' ', '-'];
			$slug .= strtolower(str_ireplace($from, $to, $arg));
			if($x < count($arg)) {
				$slug .= "-";
			}
		}

		return $slug;
	}

	/**
	 * @param $slug
	 *
	 * @return array
	 */
	public static function slugDecode($slug)
	{
		$slugArr = [];
		$slug = explode("-", $slug, 2);
		$slugArr['id'] = $slug[0];
		$slugArr['name'] = ucwords(str_replace("-", " ", $slug[1]));

		return $slugArr;
	}

	/**
	 * @param string $ip
	 *
	 * @return int
	 */
	public static function encodeIP($ip = '')
	{
		if(empty($ip)) {
			$ip = \Request::ip();
		}

		return ip2long($ip);
	}

	/**
	 * @param $ip
	 *
	 * @return string
	 */
	public static function decodeIP($ip)
	{
		return long2ip($ip);
	}

	/**
	 * @param      $str
	 * @param      $roleInfo
	 * @param bool $img
	 *
	 * @return string
	 */
	public static function color($str, $roleInfo, $img = true)
	{
		$roles = new RoleRepository(new Role);

		if(is_numeric($roleInfo)) {
			$role = $roles->getById($roleInfo);
		} else {
			$role = $roles->getByName($roleInfo);
		}

		if($role) {
			return "<span class='members-" . $role->class_name . "" . ($img ? "" : "-no-img") . "'>" . $str . "</span>";
		} else {
			\Log::warning('Utilities\Link::color - ' . $roleInfo . ' does not exist.');
		}

		return $str;
	}

	/**
	 * @param        $string
	 * @param string $placement
	 *
	 * @return string
	 */
	public static function tooltip($string, $placement='top') {
		return "data-toggle='tooltip' data-placement='" . $placement . "' title='" . $string . "'";
	}

	/**
	 * @param      $genderId
	 * @param bool $image
	 *
	 * @return string
	 */
	public static function gender($genderId, $image = true)
	{
		switch($genderId) {
			case User::GENDER_FEMALE:
				$name = "Female";
				break;
			case User::GENDER_MALE:
				$name = "Male";
				break;
			case User::GENDER_NOT_TELLING:
			default:
				$name = "Not Telling";
				break;
		}

		$ret = "";
		if($image === true) {
			$ret .= "<img src='/img/forums/gender/" . $genderId . ".png' alt='" . $name . "' /> ";
		}

		return $ret . $name;
	}

	/**
	 * @param $rsn
	 *
	 * @return array|bool|mixed
	 */
	public static function getHiscore($rsn)
	{
		if(\Cache::get('hiscores.' . $rsn)) {
			return \Cache::get('hiscores.' . $rsn);
		}

		$url='http://services.runescape.com/m=hiscore/index_lite.ws?player=' . $rsn;
		$results = \String::CURL($url);

		if(substr($results, 0, 6) == "<html>") {
			$results = false;
		} else {
			$scores = explode("\n", $results);
			foreach($scores as $key => $text) {
				$scores[$key] = explode(",", $text);
			}

			$results = $scores;
		}

		\Cache::put('hiscores.' . $rsn, $results, \Carbon::now()->addDay());

		return $results;
	}
}